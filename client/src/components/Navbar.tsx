import { Link } from 'react-router-dom';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

const Navbar = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/" className="link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/store" className="link">
              Store
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
      <FloatButton
        shape="circle"
        icon={<CustomerServiceOutlined />}
        onClick={() => alert('stop music')}
      />
    </div>
  );
};

export default Navbar;
