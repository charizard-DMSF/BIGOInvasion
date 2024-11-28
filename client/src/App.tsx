import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Login from './components/Login';
import Signup from './components/Signup';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Store from './components/store/Store';
import './styles/styles.css';

const AppContent = () => { 
  const location = useLocation();
  const showNavbar = !['/game', '/store'].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;