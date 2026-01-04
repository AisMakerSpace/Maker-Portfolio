import { useState, useEffect } from 'react';
import './PublicPortfolio.css';
import { getCurrentUser, updateUserPoints, POINTS } from '../../utils/gamification';

interface Project {
    id: string;
    title: string;
    description: string;
    author?: string;
    thumbnail?: string;
    lastEdited: string;
    materials: string[];
    steps: { id: string; text: string; image?: string }[];
    reactions?: {
        love: number;
        appreciate: number;
        badges: number;
    };
    views?: number;
}

interface PublicPortfolioProps {
    onNavigate: (view: 'landing' | 'dashboard' | 'editor' | 'portfolio', projectId?: string) => void;
}

const PublicPortfolio = ({ onNavigate }: PublicPortfolioProps) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        // Load all completed projects from localStorage
        const saved = localStorage.getItem('maker-projects');
        if (saved) {
            const allProjects: Project[] = JSON.parse(saved);
            const completed = allProjects.filter((p: any) => p.status === 'completed');
            setProjects(completed);
        }
    }, []);

    const openProjectDetail = (project: Project) => {
        setSelectedProject(project);
        // Increment view count
        const saved = localStorage.getItem('maker-projects');
        if (saved) {
            const allProjects: Project[] = JSON.parse(saved);
            const updated = allProjects.map(p =>
                p.id === project.id ? { ...p, views: (p.views || 0) + 1 } : p
            );
            localStorage.setItem('maker-projects', JSON.stringify(updated));
        }
    };

    const closeModal = () => {
        setSelectedProject(null);
    };

    const handleReaction = (type: 'love' | 'appreciate' | 'badge', projectId: string) => {
        const currentUser = getCurrentUser();

        // Update project reactions
        const saved = localStorage.getItem('maker-projects');
        if (saved) {
            const allProjects: Project[] = JSON.parse(saved);
            const updated = allProjects.map(p => {
                if (p.id === projectId) {
                    const reactions = p.reactions || { love: 0, appreciate: 0, badges: 0 };
                    return {
                        ...p,
                        reactions: {
                            ...reactions,
                            [type]: (reactions[type as keyof typeof reactions] || 0) + 1
                        }
                    };
                }
                return p;
            });
            localStorage.setItem('maker-projects', JSON.stringify(updated));

            // Update user points
            updateUserPoints(currentUser.id, POINTS.GIVE_APPRECIATION);

            // Reload projects
            const completed = updated.filter((p: any) => p.status === 'completed');
            setProjects(completed);

            // Update selected project if in modal
            if (selectedProject && selectedProject.id === projectId) {
                const updatedProject = updated.find(p => p.id === projectId);
                if (updatedProject) {
                    setSelectedProject(updatedProject);
                }
            }

            // Show feedback
            alert(`${type === 'love' ? '❤️' : type === 'appreciate' ? '👏' : '🏆'} Reaction sent! +${POINTS.GIVE_APPRECIATION} points`);
        }
    };

    return (
        <div className="public-portfolio-container">
            <header className="portfolio-header">
                <div className="container">
                    <h1>🔥 Maker Portfolio</h1>
                    <p className="subtitle">Discover amazing projects from our maker community</p>
                    <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </header>

            <main className="container portfolio-content">
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No Projects Yet</h3>
                        <p>Be the first to publish a project!</p>
                        <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="portfolio-grid">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className="portfolio-card"
                                onClick={() => openProjectDetail(project)}
                            >
                                <div className="card-thumbnail">
                                    {project.thumbnail ? (
                                        <img src={project.thumbnail} alt={project.title} />
                                    ) : (
                                        <div className="thumb-placeholder">
                                            <span className="placeholder-icon">🎨</span>
                                        </div>
                                    )}
                                    <div className="card-overlay">
                                        <span className="view-text">View Project →</span>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3>{project.title}</h3>
                                    <p className="card-description">{project.description || 'No description'}</p>
                                    <div className="card-stats">
                                        <span>👁️ {project.views || 0}</span>
                                        <span>❤️ {project.reactions?.love || 0}</span>
                                        <span>👏 {project.reactions?.appreciate || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {selectedProject && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>✕</button>
                        <div className="modal-header">
                            <h2>{selectedProject.title}</h2>
                            <p className="modal-description">{selectedProject.description}</p>
                        </div>

                        <div className="modal-body">
                            <div className="modal-section">
                                <h4>📦 Materials Used</h4>
                                <ul className="materials-list">
                                    {selectedProject.materials.filter(m => m.trim()).map((material, i) => (
                                        <li key={i}>{material}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="modal-section">
                                <h4>🛠️ Building Steps</h4>
                                <div className="steps-timeline">
                                    {selectedProject.steps.filter(s => s.text.trim() || s.image).map((step, i) => (
                                        <div key={i} className="step-item">
                                            <div className="step-number">{i + 1}</div>
                                            <div className="step-content">
                                                {step.image && (
                                                    <img src={step.image} alt={`Step ${i + 1}`} className="step-image" />
                                                )}
                                                <p>{step.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="reaction-buttons">
                                <button className="reaction-btn love" onClick={() => handleReaction('love', selectedProject.id)}>❤️ Love</button>
                                <button className="reaction-btn appreciate" onClick={() => handleReaction('appreciate', selectedProject.id)}>👏 Appreciate</button>
                                <button className="reaction-btn badge" onClick={() => handleReaction('badge', selectedProject.id)}>🏆 Award Badge</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicPortfolio;
