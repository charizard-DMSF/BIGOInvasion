import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Login from './components/Login';
import Signup from './components/Signup';
import GamePage from './components/GamePage';
import Leaderboard from './components/Leaderboard';
import Store from './components/Store';
import { Button, ConfigProvider, Space } from 'antd';

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
        <Navbar />
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/gamepage" element={<GamePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
