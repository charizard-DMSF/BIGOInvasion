import supabase from './dbModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userController = {
    createUser: async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const { data: existingUser } = await supabase
                .from('User')
                .select('*')
                .eq('username', username)
                .single();

            if (existingUser) {
                return res.status(400).json({ error: "Username already exists" })
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            const { data: newUser, error } = await supabase
                .from('User')
                .insert([{
                    username: username,
                    hashedPassword: hashedPassword,
                }])
                .select()
                .single();

            if (error) throw error;

            // Use consistent user_id field
            const token = jwt.sign(
                {
                    user_id: newUser.user_id, // Changed from newUser.id
                    username: newUser.username
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: "User successfully created!",
                token,
                user: {
                    user_id: newUser.user_id,
                    username: newUser.username
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    login: async (req, res, next) => {
        try {
            const { username, password } = req.body;
        
            const { data: user, error } = await supabase
                .from('User')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const validPassword = await bcrypt.compare(password, user.hashedPassword);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign(
                {
                    user_id: user.user_id,  // Make sure this matches your database field
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Log the user object before sending
            console.log('User object:', user);
            console.log('Response being sent:', {
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username
                }
            });

            res.json({
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    authenticateToken: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            return res.status(400).json({ error: "acces token required" })
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                res.status(400).json({ error: "invalid or expired token" })
            }
            req.user = user;
            next();
        })

    }
}

export default userController;