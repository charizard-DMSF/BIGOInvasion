import express from 'express';
import dotenv from 'dotenv';
import supabase from './dbController.js';
const app = express();
dotenv.config();
const port = 8080;
app.get('/', async (req, res) => {
  
  const { data, error } = await supabase.from('User').select("*");
  console.log('data :', data);
  if (error)
    return res.status(500).json({ error: error.message });
  res.json(data);
});
app.get('/leaderBoard', async (req, res) => {
  const { data, error } = await supabase.from('HighScore')
  .select('name, User!inner(username)')
  .eq('User.name', 'Indonesia');
});
app.post('login');
app.post('/createUser');
app.get('*') //is that how 404's are done?

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})