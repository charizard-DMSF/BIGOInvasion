import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Menu from './components/menu/Menu';
import Login from './components/register/Login';
import Signup from './components/register/Signup';
import Game from './components/game/Game';
import Leaderboard from './components/Leaderboard';
import Store from './components/store/Store';
import { Button, ConfigProvider, Space } from 'antd';
import './styles/styles.css';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#00b96b',
          borderRadius: 3,

          // Alias Token
          colorBgContainer: '#f6ffed',
        },
      }}>
      <Router>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;