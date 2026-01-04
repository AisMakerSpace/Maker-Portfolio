import { useState, useEffect } from 'react';
import './PublicPortfolio.css';
import {
    getCurrentUser,
    updateUserPoints,
    POINTS,
    addComment,
    awardProject,
    AWARDS
} from '../../utils/gamification';
import type { Comment } from '../../utils/gamification';
import PresentationMode from '../Editor/PresentationMode';

interface Project {
    id: string;
    title: string;
    description: string;
    author?: string;
    userId?: string;
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
    difficulty?: string;
    timeEstimated?: string;
    category?: string;
    social?: {
        comments: Comment[];
        awards: string[];
        madeItPhotos: string[];
    };
}

interface PublicPortfolioProps {
    onNavigate: (view: 'landing' | 'dashboard' | 'editor' | 'portfolio', projectId?: string) => void;
}

const PublicPortfolio = ({ onNavigate }: PublicPortfolioProps) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showPresentation, setShowPresentation] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [activeUser, setActiveUser] = useState(getCurrentUser());

    useEffect(() => {
        loadProjects();
        // Listen for user changes (for multi-account testing)
        const handleAuthChange = () => setActiveUser(getCurrentUser());
        window.addEventListener('storage', handleAuthChange);
        return () => window.removeEventListener('storage', handleAuthChange);
    }, []);

    const loadProjects = () => {
        const saved = localStorage.getItem('maker-projects');
        if (saved) {
            const allProjects: Project[] = JSON.parse(saved);
            const completed = allProjects.filter((p: any) => p.status === 'completed');
            setProjects(completed);

            // Sync selected project if open
            if (selectedProject) {
                const updated = completed.find(p => p.id === selectedProject.id);
                if (updated) setSelectedProject(updated);
            }
        }
    };

    const openProjectDetail = (project: Project) => {
        setSelectedProject(project);
        window.scrollTo(0, 0);

        // Increment view count
        const saved = localStorage.getItem('maker-projects');
        if (saved) {
            const allProjects: Project[] = JSON.parse(saved);
            const updated = allProjects.map(p =>
                p.id === project.id ? { ...p, views: (p.views || 0) + 1 } : p
            );
            localStorage.setItem('maker-projects', JSON.stringify(updated));
            setProjects(updated.filter((p: any) => p.status === 'completed'));
        }
    };

    const handleReaction = (type: 'love' | 'appreciate' | 'badge', projectId: string) => {
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
            updateUserPoints(activeUser.id, POINTS.GIVE_APPRECIATION);
            loadProjects();
            alert('✨ Feedback sent!');
        }
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !selectedProject) return;

        addComment(selectedProject.id, commentText);
        setCommentText('');
        loadProjects();
    };

    const handleAward = (awardId: string) => {
        if (!selectedProject) return;
        awardProject(selectedProject.id, awardId);
        loadProjects();
        alert('🏆 Award gifted! You earned points for your appreciation.');
    };

    if (showPresentation && selectedProject) {
        return (
            <PresentationMode
                title={selectedProject.title}
                description={selectedProject.description}
                steps={selectedProject.steps}
                onClose={() => setShowPresentation(false)}
            />
        );
    }

    if (selectedProject) {
        const projectAwards = selectedProject.social?.awards || [];
        const comments = selectedProject.social?.comments || [];

        return (
            <div className="project-page-view animate-in">
                <nav className="project-page-nav">
                    <div className="container nav-flex">
                        <button className="btn-back-link" onClick={() => setSelectedProject(null)}>← Back to Gallery</button>
                        <div className="project-page-actions">
                            <button className="btn-secondary" onClick={() => setShowPresentation(true)}>Launch Slideshow</button>
                            <button className="btn-primary" onClick={() => handleReaction('appreciate', selectedProject.id)}>👏 Appreciate</button>
                        </div>
                    </div>
                </nav>

                <main className="container project-page-content">
                    <header className="project-page-header">
                        <div className="category-badge">{selectedProject.category || 'Workshop'}</div>
                        <h1>{selectedProject.title}</h1>
                        <div className="project-meta-row">
                            <span className="meta-item">👤 By @Maker</span>
                            <span className="meta-item">👁️ {selectedProject.views || 0} views</span>
                            <span className="meta-item">🕒 {selectedProject.timeEstimated || 'Unknown time'}</span>
                            <span className="meta-item-badge">{selectedProject.difficulty || 'Easy'}</span>

                            <div className="mini-awards-row">
                                {projectAwards.slice(0, 5).map((a, i) => {
                                    const award = AWARDS.find(aw => aw.id === a);
                                    return <span key={i} className="mini-award" title={award?.name}>{award?.icon}</span>;
                                })}
                                {projectAwards.length > 5 && <span className="more-awards">+{projectAwards.length - 5}</span>}
                            </div>
                        </div>
                        <p className="project-intro">{selectedProject.description}</p>
                    </header>

                    <div className="project-grid-main">
                        <div className="project-steps-column">
                            <section className="instructions-section">
                                <h2>🛠️ Instructions</h2>
                                <div className="steps-list-public">
                                    {selectedProject.steps.filter(s => s.text.trim() || s.image).map((step, i) => (
                                        <div key={i} className="public-step-card">
                                            <div className="step-header">
                                                <span className="step-label">Step {i + 1}</span>
                                            </div>
                                            {step.image && <img src={step.image} alt={`Step ${i + 1}`} className="step-img-public" />}
                                            <p className="step-text-public">{step.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="social-section-enhanced">
                                <div className="comment-system">
                                    <h3>💬 Community Feedback ({comments.length})</h3>

                                    <form className="comment-form" onSubmit={handlePostComment}>
                                        <img src={activeUser.avatar} className="user-mini-avatar" alt="You" />
                                        <div className="comment-input-wrap">
                                            <input
                                                type="text"
                                                placeholder="Ask a question or share your results..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />
                                            <button type="submit" disabled={!commentText.trim()}>Post</button>
                                        </div>
                                    </form>

                                    <div className="comments-list">
                                        {comments.length === 0 ? (
                                            <p className="no-comments">No comments yet. Be the first to start the conversation!</p>
                                        ) : (
                                            comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(c => (
                                                <div key={c.id} className="comment-card">
                                                    <img src={c.avatar} alt={c.username} className="comment-avatar" />
                                                    <div className="comment-content">
                                                        <div className="comment-meta">
                                                            <span className="comment-author">{c.username}</span>
                                                            <span className="comment-date">{new Date(c.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <p>{c.text}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="project-sidebar-public">
                            <div className="sidebar-card">
                                <h3>📦 Materials</h3>
                                <ul className="materials-list-public">
                                    {selectedProject.materials.filter(m => m.trim()).map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="sidebar-card feedback-card">
                                <h3>Gift an Award</h3>
                                <p className="award-hint">Award points to the creator for their hard work!</p>
                                <div className="award-buttons-grid">
                                    {AWARDS.map(award => (
                                        <button
                                            key={award.id}
                                            className="btn-award"
                                            onClick={() => handleAward(award.id)}
                                        >
                                            <span className="award-icon">{award.icon}</span>
                                            <span className="award-name">{award.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="sidebar-card">
                                <h3>Achievements</h3>
                                <div className="awards-inventory">
                                    {projectAwards.length === 0 ? (
                                        <p className="empty-awards">No awards yet.</p>
                                    ) : (
                                        <div className="awards-wrap">
                                            {AWARDS.map(a => {
                                                const count = projectAwards.filter(pa => pa === a.id).length;
                                                if (count === 0) return null;
                                                return (
                                                    <div key={a.id} className="inventory-item">
                                                        <span className="inv-icon">{a.icon}</span>
                                                        <span className="inv-count">x{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="public-portfolio-container">
            <header className="portfolio-header">
                <div className="container header-flex-main">
                    <div>
                        <h1>🔥 Maker Community</h1>
                        <p className="subtitle">Discover, Learn, and Share workshop projects</p>
                    </div>
                    <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
                        Share a Project
                    </button>
                </div>
            </header>

            <main className="container portfolio-content">
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>The workshop is quiet...</h3>
                        <p>Be the first to share your maker journey!</p>
                        <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
                            Create First Guide
                        </button>
                    </div>
                ) : (
                    <div className="portfolio-grid">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className="portfolio-card-premium"
                                onClick={() => openProjectDetail(project)}
                            >
                                <div className="card-image">
                                    {project.steps.find(s => s.image)?.image ? (
                                        <img src={project.steps.find(s => s.image)?.image} alt={project.title} />
                                    ) : (
                                        <div className="thumb-placeholder">🛠️</div>
                                    )}
                                    <div className="card-badge">{project.difficulty || 'Easy'}</div>
                                </div>
                                <div className="card-info">
                                    <span className="card-cat">{project.category || 'Workshop'}</span>
                                    <h3>{project.title}</h3>
                                    <div className="card-meta">
                                        <span>👁️ {project.views || 0}</span>
                                        <span>❤️ {project.reactions?.love || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PublicPortfolio;
