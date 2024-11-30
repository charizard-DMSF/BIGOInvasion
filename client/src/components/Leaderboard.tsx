import React from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
  date: string;
}

// mock data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "Stephanie", score: 150000, level: 42, date: "2024-11-30" },
  { rank: 2, username: "DanDanDan", score: 145000, level: 38, date: "2024-11-29" },
  { rank: 3, username: "syntax_error", score: 142000, level: 35, date: "2024-11-30" },
  { rank: 4, username: "recursive_pro", score: 138000, level: 33, date: "2024-11-28" },
  { rank: 5, username: "array_index", score: 135000, level: 31, date: "2024-11-30" },
  { rank: 6, username: "binary_search", score: 132000, level: 30, date: "2024-11-29" },
  { rank: 7, username: "stack_overflow", score: 128000, level: 28, date: "2024-11-28" },
  { rank: 8, username: "merge_sort", score: 125000, level: 27, date: "2024-11-27" },
  { rank: 9, username: "Felipe", score: 120000, level: 25, date: "2024-11-26" },
  { rank: 10, username: "Matthews", score: 118000, level: 24, date: "2024-11-25" },
];

interface LeaderboardProps {
  onStatsClick?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onStatsClick }) => {
  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Global Rankings</h2>

      <div className="leaderboard-stats">
        <div className="stat-box">
          <span className="stat-label">Players</span>
          <span className="stat-value">10,427</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Games Played</span>
          <span className="stat-value">52,834</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Top Score</span>
          <span className="stat-value">150,000</span>
        </div>
      </div>

      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              <th>Level</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((entry) => (
              <tr key={entry.rank}>
                <td>
                  <span className={`rank rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                    {entry.rank}
                  </span>
                </td>
                <td>{entry.username}</td>
                <td>{entry.score.toLocaleString()}</td>
                <td>{entry.level}</td>
                <td>{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="leaderboard-footer">
      </div>
    </div>
  );
};

export default Leaderboard;