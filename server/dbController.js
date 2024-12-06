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

    // Save Session
saveGameState: async (req, res, next) => {
    console.log('Received request body:', req.body);
    console.log('Headers:', req.headers);
    
    try {
        const { userId, gameState } = req.body;
        
        // Validate input
        if (!userId) {
            console.log('Missing userId');
            return res.status(400).json({ error: 'Missing userId' });
        }
        
        if (!gameState) {
            console.log('Missing gameState');
            return res.status(400).json({ error: 'Missing gameState' });
        }

        console.log('UserID:', userId);
        console.log('GameState:', gameState);

        // First delete any existing saves for this user
        const { error: deleteError } = await supabase
            .from('SavedGames')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return res.status(500).json({ error: deleteError.message });
        }

        // Then insert the new save
        const { data, error: insertError } = await supabase
            .from('SavedGames')
            .insert([{
                user_id: userId,
                game_state: gameState,
                saved_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return res.status(500).json({ error: insertError.message });
        }

        res.locals.savedGame = data;
        return res.status(200).json({ message: 'Game saved successfully', data });
    } catch (error) {
        console.error('Save game error:', error);
        return res.status(500).json({ error: error.message });
    }
},
 
 //load  session

  loadGameState: async (req, res, next) => {
    const userId = req.params.userId;
    
    try {
      const { data, error } = await supabase
        .from('SavedGames')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      res.locals.gameState = data?.game_state || null;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};





export default dbController
