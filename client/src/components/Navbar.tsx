import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/" className="link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/login" className="link">
            Login
          </Link>
        </li>
        <li>
          <Link to="/signup" className="link">
            Signup
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
