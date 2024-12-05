import express from 'express';
import dotenv from 'dotenv';
// import supabase from './dbModel.js';
import dbController from './dbController.js';
const app = express();
dotenv.config();
const port = 8080;

app.get('/leaders', async (req, res) => {
  console.log("in the server function")
  // res.sendStatus(500).send('sent it')
});

app.get('/', async (req, res) => {
  
  const { data, error } = await supabase.from('User').select("*");
  console.log('data :', data);
  if (error)
    return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('login');
app.post('/createUser');
app.get('*', () => res.sendStatus(404)) //is that how 404's are done?

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
