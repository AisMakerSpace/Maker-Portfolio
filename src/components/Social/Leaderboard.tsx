import { useState, useEffect } from 'react';
import { getLeaderboard, BADGES, User } from '../../utils/gamification';
import './Leaderboard.css';

const Leaderboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');

    useEffect(() => {
        const leaderboard = getLeaderboard();
        setUsers(leaderboard);
    }, []);

    const getUserBadges = (badgeIds: string[]) => {
        return BADGES.filter(b => badgeIds.includes(b.id));
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>🏆 Leaderboard</h2>
                <div className="time-filters">
                    <button
                        className={timeFilter === 'week' ? 'active' : ''}
                        onClick={() => setTimeFilter('week')}
                    >
                        This Week
                    </button>
                    <button
                        className={timeFilter === 'month' ? 'active' : ''}
                        onClick={() => setTimeFilter('month')}
                    >
                        This Month
                    </button>
                    <button
                        className={timeFilter === 'all' ? 'active' : ''}
                        onClick={() => setTimeFilter('all')}
                    >
                        All Time
                    </button>
                </div>
            </div>

            <div className="leaderboard-list">
                {users.map((user, index) => (
                    <div
                        key={user.id}
                        className={`leaderboard-item ${index === 0 ? 'first-place' : index === 1 ? 'second-place' : index === 2 ? 'third-place' : ''}`}
                    >
                        <div className="rank-badge">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div className="user-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="user-info">
                            <div className="username">{user.username}</div>
                            <div className="user-badges">
                                {getUserBadges(user.badges).slice(0, 3).map(badge => (
                                    <span key={badge.id} className="badge-icon" title={badge.name}>
                                        {badge.icon}
                                    </span>
                                ))}
                                {user.badges.length > 3 && (
                                    <span className="badge-more">+{user.badges.length - 3}</span>
                                )}
                            </div>
                        </div>
                        <div className="user-points">
                            <div className="points-value">{user.points}</div>
                            <div className="points-label">points</div>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="empty-leaderboard">
                    <p>No makers yet. Be the first to publish a project!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
