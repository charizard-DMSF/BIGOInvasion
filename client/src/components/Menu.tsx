import { Link } from 'react-router-dom';
import bigoImage from '../../public/assets/bigo.png';

const Menu = () => {
  return (
    <div className="menu">
      <h1 id="title">Big O Invasion</h1>
      <img
        src={bigoImage}
        alt="Big O Invasion"
        style={{ width: '400px', height: 'auto', alignSelf: 'center' }}
      />
      <div className="menu-content">
        <Link to="/gamepage" className="link">
          <h2>New Game</h2>
        </Link>
        <Link to="/leaderboard" className="link">
          <h2>Leaderboard</h2>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
