import express from 'express';
import dotenv from 'dotenv';
//import supabase from './dbController.js';
const app = express();
dotenv.config();
const port = 8080;

app.get('/', async (req, res) => {
  const { data, error } = await supabase.from('User').select('*');
  console.log('data :', data);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
