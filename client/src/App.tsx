import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Menu from './components/menu/Menu';
import Login from './components/register/Login';
import Signup from './components/register/Signup';
import Game from './components/game/Game';
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/store" element={<Store />} />
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