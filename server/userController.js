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
            return res.status(400).json({error: "Username already exists"})
            }

            // hash password 
            const salt_factor = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);


            const { data: newUser, error } = await supabase
                .from('User')
                .insert([
                    {
                        username: username,
                        password: hashedPassword,
                        created_at: new Date().toISOString
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
                
            const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
             );


            res.status(201).json({
                message: "User successfully created!".
                token,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                }
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
       }


     },


    login: async (req, res, next) => {
        try {
            const { username, password } = req.body;

            // find user
            const { data: user, error } = await supabase
                .from('User')
                .select('*')
                .eq('username', username)
                .single();
                 
            if (error || !user) {
                return res.status(500).json({error: 'username does not exist'})
            }

            // check password => this'll be a boolean 
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(500).json({error: 'password incorrect'})
            }

            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                id: user.id,
                username: user.username,
                email: user.email
                }
            });        
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },

    authenticateToken: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader

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