import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { React } from

const Store = () => {
  const [stats, setStats] = useState({
    Speed: { value: 1, cost: 10, quantity: 0 },
    Damage: { value: 1, cost: 10, quantity: 0 },
    Health: { value: 1, cost: 10, quantity: 0 },
    Shield: { value: 1, cost: 10, quantity: 0 },
    'Attack Speed': { value: 1, cost: 10, quantity: 0 },
    Dash: { value: 1, cost: 10, quantity: 0 },
  });

  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    calculateTotalCost();
  }, [stats]);

  const handleQuantityChange = (stat: string, change: number) => {};

  const calculateTotalCost = () => {};

  return (
    <div className="store-content">
      <div className="store-menu">
        <Link to="/" className="link">
          Back
        </Link>
        <div>
          <p>Matt Bucks:</p>{' '}
        </div>
      </div>
      <div className="store-tables">
        {/* power ups table */}
        <div className="power-ups">
          Power Ups
          <div>Speed++</div>
          <div>Health Up</div>
          <div>Guns</div>
          <div>Shielf</div>
          <div>Attack Speed</div>
          <div>Nuke</div>
        </div>
        {/* stats table */}
        <div className="stats-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Stats</th>
                <th>Cost</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([statName, statData]) => (
                <tr key={statName}>
                  <td>{statName}</td>
                  <td>{statData.value}</td>
                  <td>{statData.cost}</td>
                  <td className="quantity">
                    {statData.quantity}
                    <div className="quantity-adjustment">
                      <button onClick={() => handleQuantityChange(statName, 1)}>
                        +
                      </button>
                      <button
                        onClick={() => handleQuantityChange(statName, -1)}>
                        -
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Total Cost: ${totalCost}</p>
          <button>Puchase</button>
        </div>
      </div>
    </div>
  );
};

export default Store;
