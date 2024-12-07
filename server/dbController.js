import supabase from './dbModel.js'


const dbController = {
// Add High Score
 addHighScore: async (req, res, next) => {
    console.log(req.body.userId)
    const { data, error } = await supabase
        .from('HighScores')
        .insert([{ user_id: req.body.userId, score: req.body.score }]);
        next();
    },
    

// Get top 3 high scores
getTopScores: async (req, res, next) => {
    const { data, error } = await supabase
        .from('HighScores')
        .select(`score, User (username), achived_at`)
        .order('score', { ascending: false })
        .limit(10);
        console.log('data', data);
        res.locals = data;

    next();
},

// Get username based on the user id
getUserName: async (req, res, next) => {
    console.log('userName func hit db Controler')
    const { data, error } = await supabase
    .from('User')
    .select('username')
    .eq('user_id', req.body.userId);
    console.log('data', data);
    res.locals = data;

  next();
    },

    // save Session
saveGameState: async (req, res, next) => {
    try {
        const { userId, gameState } = req.body;
        
        if (!userId) {
            console.log('Missing userId');
            return res.status(400).json({ error: 'Missing userId' });
        }
        
        // delete existing session for this user
        const { error: deleteError } = await supabase
            .from('Session')
            .delete()
            .eq('user_id', userId);
            
        if (deleteError) throw deleteError;

        // create new session
        const { data, error } = await supabase
            .from('Session')
            .insert([{
                user_id: userId,
                gameState: gameState,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        
        res.status(200).json({
            message: 'Game saved successfully',
            data
        });
    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({ error: error.message });
    }
},
 
 //load  session

loadGameState: async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const { data, error } = await supabase
            .from('Session')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;
        
        res.locals.gameState = data?.gameState || null;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
};





export default dbController
