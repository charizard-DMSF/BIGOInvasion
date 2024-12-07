import express from 'express';
import dotenv from 'dotenv';
import supabase from './dbModel.js';
import dbController from './dbController.js';
import userController from './userController.js';
import cors from "cors"
const app = express();
dotenv.config();
const port = 8080;


app.use(cors())
app.use(express.json());


app.get('/userName', dbController.getUserName, async (req, res) => {
  res.status(200).json({'data': res.locals})
});

app.post('/newScore', userController.authenticateToken, dbController.addHighScore, async (req, res) => {
  console.log("addHighScore Activated")
  res.sendStatus(200)
});

app.delete('/deleteScore', userController.authenticateToken, dbController.deleteGameSession, async (req, res) => {
  console.log("addHighScore Activated")
  res.sendStatus(200)
});

app.get('/', async (req, res) => {
  
  const { data, error } = await supabase.from('User').select("*");
  console.log('data :', data);
  if (error)
  return res.status(500).json({ error: error.message });
  res.json(data);
});


/*
app.get('/leaders', dbController.getTopScores, async (req, res) => {
  console.log("in the server function")
  res.status(500)
});
*/


app.get('/leaders', dbController.getTopScores, async (req, res) => {
  res.status(200).json({'data': res.locals})
});



app.post('/createUser', userController.createUser, async (req, res) =>{
  res.sendStatus(200);
});
app.post('/login', userController.login);

app.post('/saveGame', dbController.saveGameState, (req, res) => {
    if (res.locals.savedGame) {
        res.status(200).json({ message: 'Game saved successfully', data: res.locals.savedGame });
    }
});

app.get('/loadGame/:userId', userController.authenticateToken, dbController.loadGameState, async (req, res) => {
  res.status(200).json({ gameState: res.locals.gameState });
});


app.get('*', (req, res) => res.sendStatus(404)) //is that how 404's are done?

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
