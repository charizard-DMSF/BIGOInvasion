import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
  date: string;
}

interface LeaderboardProps {
  onStatsClick?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({
    players: 0,
    gamesPlayed: 0,
    topScore: 0
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return 'Invalid Date';
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('http://localhost:8080/leaders');
      const result = await response.json();

      if (result.data) {
        const transformedData = result.data.map((entry: any, index: number) => ({
          rank: index + 1,
          username: entry.User.username,
          score: entry.score,
          level: Math.floor(entry.score / 3500),
          date: formatDate(entry.achived_at)
        }));

        setLeaderboardData(transformedData);

        // update stats
        if (transformedData.length > 0) {
          setStats({
            players: transformedData.length,
            gamesPlayed: transformedData.length * 5,
            topScore: Math.max(...transformedData.map((entry: LeaderboardEntry) => entry.score))
          });
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Global Rankings</h2>
      <div className="leaderboard-stats">
        <div className="stat-box">
          <span className="stat-label">Players</span>
          <span className="stat-value">{stats.players.toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Games Played</span>
          <span className="stat-value">{stats.gamesPlayed.toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Top Score</span>
          <span className="stat-value">{stats.topScore.toLocaleString()}</span>
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
            {leaderboardData.map((entry) => (
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