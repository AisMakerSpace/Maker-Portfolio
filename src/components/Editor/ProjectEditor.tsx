import { useState, useEffect } from 'react';
import './ProjectEditor.css';

interface ProjectData {
    id?: string;
    title: string;
    description: string;
    materials: string[];
    steps: { id: string; text: string; image?: string }[];
    status?: 'draft' | 'completed';
    lastEdited?: string;
}

interface EditorProps {
    onNavigate: (view: 'landing' | 'dashboard' | 'editor', projectId?: string) => void;
    projectId: string | null;
}

const ProjectEditor = ({ onNavigate, projectId }: EditorProps) => {
    const [data, setData] = useState<ProjectData>({
        title: 'New Maker Project',
        description: '',
        materials: [''],
        steps: [{ id: '1', text: '' }]
    });

    const [activeSection, setActiveSection] = useState('info');
    const [lastSaved, setLastSaved] = useState<string>('Never');
    const [isSaving, setIsSaving] = useState(false);

    // Load project if editing
    useEffect(() => {
        if (projectId) {
            const saved = localStorage.getItem('maker-projects');
            if (saved) {
                const projects: (ProjectData & { id: string })[] = JSON.parse(saved);
                const found = projects.find(p => p.id === projectId);
                if (found) {
                    // Ensure all required fields exist with defaults
                    setData({
                        title: found.title || 'New Maker Project',
                        description: found.description || '',
                        materials: Array.isArray(found.materials) && found.materials.length > 0 ? found.materials : [''],
                        steps: Array.isArray(found.steps) && found.steps.length > 0 ? found.steps : [{ id: '1', text: '' }],
                        status: found.status,
                        id: found.id,
                        lastEdited: found.lastEdited
                    });
                }
            }
        }
    }, [projectId]);

    // Simple Auto-save simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            saveProject();
        }, 2000);
        return () => clearTimeout(timer);
    }, [data]);

    const saveProject = () => {
        setIsSaving(true);
        const saved = localStorage.getItem('maker-projects');
        let projects = saved ? JSON.parse(saved) : [];

        const projectToSave = {
            ...data,
            id: projectId || Date.now().toString(),
            lastEdited: new Date().toLocaleString(),
            status: data.status || 'draft'
        };

        if (projectId) {
            projects = projects.map((p: any) => p.id === projectId ? projectToSave : p);
        } else {
            projects.push(projectToSave);
        }

        localStorage.setItem('maker-projects', JSON.stringify(projects));

        setTimeout(() => {
            setLastSaved(new Date().toLocaleTimeString());
            setIsSaving(false);
        }, 500);
    };

    const handlePublish = () => {
        const updatedData = { ...data, status: 'completed' as 'draft' | 'completed' };
        setData(updatedData);
        // Explicit save with completed status
        const saved = localStorage.getItem('maker-projects');
        let projects = saved ? JSON.parse(saved) : [];
        const projectToSave = {
            ...updatedData,
            id: projectId || Date.now().toString(),
            lastEdited: new Date().toLocaleString()
        };
        if (projectId) {
            projects = projects.map((p: any) => p.id === projectId ? projectToSave : p);
        } else {
            projects.push(projectToSave);
        }
        localStorage.setItem('maker-projects', JSON.stringify(projects));
        alert('🎉 Portfolio Published Successfully!');
        onNavigate('dashboard');
    };

    const addMaterial = () => setData(prev => ({ ...prev, materials: [...prev.materials, ''] }));
    const addStep = () => setData(prev => ({ ...prev, steps: [...prev.steps, { id: Date.now().toString(), text: '' }] }));

    const handleImageUpload = (stepId: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setData(prev => ({
                ...prev,
                steps: prev.steps.map(s => s.id === stepId ? { ...s, image: base64String } : s)
            }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="editor-container">
            <nav className="editor-nav">
                <div className="container editor-nav-flex">
                    <div className="editor-breadcrumb">
                        <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Projects</span> / <strong>{data.title}</strong>
                    </div>
                    <div className="save-status">
                        {isSaving ? 'Saving...' : `Last saved: ${lastSaved}`}
                    </div>
                    <div className="editor-actions">
                        <button className="btn-secondary" onClick={() => setActiveSection('preview')}>Preview Poster</button>
                        <button className="btn-primary" onClick={handlePublish}>Publish Portfolio</button>
                    </div>
                </div>
            </nav>

            <main className="container editor-layout">
                <aside className="editor-sidebar">
                    <div className="sections-list">
                        <div className={`section-item ${activeSection === 'info' ? 'active' : ''}`} onClick={() => setActiveSection('info')}>Project Info</div>
                        <div className={`section-item ${activeSection === 'materials' ? 'active' : ''}`} onClick={() => setActiveSection('materials')}>Materials List</div>
                        <div className={`section-item ${activeSection === 'steps' ? 'active' : ''}`} onClick={() => setActiveSection('steps')}>Process Steps</div>
                        <div className={`section-item ${activeSection === 'preview' ? 'active' : ''}`} onClick={() => setActiveSection('preview')}>Design Poster</div>
                    </div>
                </aside>

                <section className="editor-main-content">
                    {activeSection === 'info' && (
                        <div className="editor-card animate-in">
                            <input
                                className="title-input"
                                placeholder="Give your project a name..."
                                value={data.title}
                                onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                            />

                            <textarea
                                className="description-input"
                                placeholder="What did you make today? Tell your story..."
                                value={data.description}
                                onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                            />

                            <div className="editor-actions-footer">
                                <button className="btn-primary" onClick={() => setActiveSection('materials')}>Next: Materials ➔</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'materials' && (
                        <div className="editor-card animate-in">
                            <h4>Materials Used</h4>
                            <p className="section-help">List the components, tools, and materials you used.</p>
                            <div className="materials-list-editor">
                                {data.materials.map((m, i) => (
                                    <div key={i} className="list-input-wrapper">
                                        <input
                                            className="list-input"
                                            placeholder="e.g. 3D Printed Chassis"
                                            value={m}
                                            onChange={e => {
                                                const newM = [...data.materials];
                                                newM[i] = e.target.value;
                                                setData(prev => ({ ...prev, materials: newM }));
                                            }}
                                        />
                                        <button className="btn-delete-small" onClick={() => {
                                            const newM = data.materials.filter((_, idx) => idx !== i);
                                            setData(prev => ({ ...prev, materials: newM.length ? newM : [''] }));
                                        }}>✕</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addMaterial} className="add-btn">+ Add Material</button>

                            <div className="editor-actions-footer">
                                <button className="btn-secondary" onClick={() => setActiveSection('info')}>Back</button>
                                <button className="btn-primary" onClick={() => setActiveSection('steps')}>Next: Steps ➔</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'steps' && (
                        <div className="editor-card animate-in">
                            <h4>Building Steps</h4>
                            <p className="section-help">Document your progress with photos and descriptions.</p>
                            <div className="steps-list-editor">
                                {data.steps.map((step, i) => (
                                    <div key={step.id} className="step-input-group">
                                        <div className="step-header">
                                            <span className="step-num">{i + 1}</span>
                                            <button className="btn-delete-small" onClick={() => {
                                                const newS = data.steps.filter(s => s.id !== step.id);
                                                setData(prev => ({ ...prev, steps: newS.length ? newS : [{ id: '1', text: '' }] }));
                                            }}>✕ Remove Step</button>
                                        </div>
                                        <textarea
                                            placeholder="Describe what you did in this step..."
                                            value={step.text}
                                            onChange={e => {
                                                const newS = [...data.steps];
                                                newS[i] = { ...newS[i], text: e.target.value };
                                                setData(prev => ({ ...prev, steps: newS }));
                                            }}
                                        />
                                        <label className="step-image-upload">
                                            {step.image ? (
                                                <div className="image-preview-container">
                                                    <img src={step.image} alt="Step preview" className="step-preview-img" />
                                                    <div className="image-overlay">Change Photo</div>
                                                </div>
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <span className="upload-icon">📸</span>
                                                    <span>Add Step Photo</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(step.id, file);
                                                }}
                                            />
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addStep} className="add-btn">+ Add Next Step</button>

                            <div className="editor-actions-footer">
                                <button className="btn-secondary" onClick={() => setActiveSection('materials')}>Back</button>
                                <button className="btn-primary" onClick={() => setActiveSection('preview')}>Preview Poster ➔</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'preview' && (
                        <div className="poster-preview-container animate-in">
                            <div className="poster-a4 shadow-lg">
                                <header className="poster-header">
                                    <div className="poster-badge">MAKER PORTFOLIO</div>
                                    <h1>{data.title || 'Untitled Project'}</h1>
                                    <p className="poster-desc">{data.description || 'No description provided yet.'}</p>
                                </header>

                                <div className="poster-grid">
                                    <div className="poster-column">
                                        <h3>MATERIALS</h3>
                                        <ul className="poster-materials">
                                            {data.materials.filter(m => m.trim()).map((m, i) => (
                                                <li key={i}>{m}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="poster-column main-steps">
                                        <h3>MAKING PROCESS</h3>
                                        <div className="poster-steps">
                                            {data.steps.filter(s => s.text.trim() || s.image).map((step, i) => (
                                                <div key={i} className="poster-step-item">
                                                    <div className="step-label">Step {i + 1}</div>
                                                    {step.image && <img src={step.image} className="poster-step-img" />}
                                                    <p>{step.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <footer className="poster-footer">
                                    <div className="maker-info">
                                        <span>MAKER ID: #88291</span>
                                        <span>DATE: {new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="qr-placeholder">QR CODE</div>
                                </footer>
                            </div>

                            <div className="editor-actions-footer">
                                <button className="btn-secondary" onClick={() => setActiveSection('steps')}>Back to Editor</button>
                                <button className="btn-primary btn-large" onClick={handlePublish}>Publish & Print ➔</button>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ProjectEditor;
