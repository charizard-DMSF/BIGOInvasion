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
        .select('*')
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
}

}

export default dbController
