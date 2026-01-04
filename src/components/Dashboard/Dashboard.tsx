import { useState } from 'react';
import './Dashboard.css';

interface Project {
    id: string;
    title: string;
    lastEdited: string;
    status: 'draft' | 'completed';
    thumbnail?: string;
}

interface DashboardProps {
    onNavigate: (view: 'landing' | 'dashboard' | 'editor') => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
    const [projects] = useState<Project[]>([
        { id: '1', title: 'Solar Powered Rover', lastEdited: '2 hours ago', status: 'draft' },
        { id: '2', title: 'Hydraulic Claw', lastEdited: '1 day ago', status: 'completed' },
        { id: '3', title: 'Smart Plant Monitor', lastEdited: '3 days ago', status: 'draft' },
    ]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="container header-flex">
                    <div className="user-welcome">
                        <span className="wave">👋</span>
                        <div>
                            <h2 style={{ cursor: 'pointer' }} onClick={() => onNavigate('landing')}>Welcome back, Maker!</h2>
                            <p>You have {projects.length} active projects</p>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => onNavigate('editor')}>+ New Project</button>
                </div>
            </header>

            <main className="container dashboard-content">
                <div className="stats-grid">
                    <div className="card stat-card">
                        <span className="stat-value">12</span>
                        <span className="stat-label">Hours Documentation</span>
                    </div>
                    <div className="card stat-card">
                        <span className="stat-value">5</span>
                        <span className="stat-label">Posters Created</span>
                    </div>
                    <div className="card stat-card">
                        <span className="stat-value">24</span>
                        <span className="stat-label">Photos Uploaded</span>
                    </div>
                </div>

                <div className="projects-section">
                    <div className="section-header">
                        <h3>Recent Projects</h3>
                        <div className="filters">
                            <span className="active">All</span>
                            <span>Drafts</span>
                            <span>Completed</span>
                        </div>
                    </div>

                    <div className="project-grid">
                        {projects.map(project => (
                            <div key={project.id} className="card project-card">
                                <div className="project-thumb">
                                    {project.thumbnail ? (
                                        <img src={project.thumbnail} alt={project.title} />
                                    ) : (
                                        <div className="thumb-placeholder">⚙️</div>
                                    )}
                                    <span className={`status-badge ${project.status}`}>{project.status}</span>
                                </div>
                                <div className="project-info">
                                    <h4>{project.title}</h4>
                                    <p>Edited {project.lastEdited}</p>
                                    <div className="project-actions">
                                        <button className="btn-icon" onClick={() => onNavigate('editor')}>✏️</button>
                                        <button className="btn-icon">📁</button>
                                        <button className="btn-icon">💬</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="card create-card" onClick={() => onNavigate('editor')}>
                            <div className="create-icon">+</div>
                            <p>Start Documentation</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
