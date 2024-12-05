import supabase from './dbModel.js'


const dbController = {
// Add High Score
 addHighScore: async (req, res, next) => {
    console.log(req.body)
    const { data, error } = await supabase
        .from('HighScores')
        .insert([{ user_id: 1, score: 70000 }]);
        next()
},
// Get top 3 high scores
getTopScores: async (req, res, next) => {
    const { data, error } = await supabase
        .from('HighScores')
        .select('*')
        .order('score', { ascending: false })
        .limit(3);
        console.log('data', data)
        res.locals = data

    next();
},

}

export default dbController