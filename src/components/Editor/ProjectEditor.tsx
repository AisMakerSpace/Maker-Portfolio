import { useState, useEffect } from 'react';
import './ProjectEditor.css';
import PosterEditor from '../PosterEditor/PosterEditor';
import PresentationMode from './PresentationMode';

interface ProjectData {
    id?: string;
    title: string;
    description: string;
    materials: string[];
    steps: { id: string; text: string; image?: string }[];
    status?: 'draft' | 'completed';
    lastEdited?: string;
    // New Instructables-style metadata
    difficulty?: 'easy' | 'intermediate' | 'expert';
    timeEstimated?: string;
    category?: string;
    posterData?: any;
}

interface EditorProps {
    onNavigate: (view: 'landing' | 'dashboard' | 'editor' | 'portfolio', projectId?: string) => void;
    projectId: string | null;
}

const ProjectEditor = ({ onNavigate, projectId }: EditorProps) => {
    const [data, setData] = useState<ProjectData>({
        title: 'New Maker Project',
        description: '',
        materials: [''],
        steps: [{ id: '1', text: '' }],
        difficulty: 'easy',
        timeEstimated: '',
        category: 'Workshop'
    });

    const [activeSection, setActiveSection] = useState<'editor' | 'poster' | 'presentation'>('editor');
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
                    setData({
                        ...found,
                        title: found.title || 'New Maker Project',
                        description: found.description || '',
                        materials: Array.isArray(found.materials) && found.materials.length > 0 ? found.materials : [''],
                        steps: Array.isArray(found.steps) && found.steps.length > 0 ? found.steps : [{ id: '1', text: '' }],
                        difficulty: found.difficulty || 'easy',
                        timeEstimated: found.timeEstimated || '',
                        category: found.category || 'Workshop'
                    });
                }
            }
        }
    }, [projectId]);

    // Simple Auto-save simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            saveProject();
        }, 3000);
        return () => clearTimeout(timer);
    }, [data]);

    const saveProject = (explicitData?: ProjectData) => {
        setIsSaving(true);
        const currentData = explicitData || data;
        const saved = localStorage.getItem('maker-projects');
        let projects = saved ? JSON.parse(saved) : [];

        const projectToSave = {
            ...currentData,
            id: projectId || Date.now().toString(),
            lastEdited: new Date().toLocaleString(),
            status: currentData.status || 'draft'
        };

        if (projectId) {
            projects = projects.map((p: any) => p.id === projectId ? projectToSave : p);
        } else {
            // If it's a new project and we just saved, we should really have an ID now
            // For simplicity in this demo, we'll assume the user stays on the page or we redirect
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
        saveProject(updatedData);
        alert('🎉 Portfolio Published Successfully!');
        onNavigate('portfolio');
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

    const handlePosterSave = (canvasData: any) => {
        setData(prev => ({ ...prev, posterData: canvasData }));
        saveProject({ ...data, posterData: canvasData });
        alert('🎨 Poster design saved to project!');
        setActiveSection('editor');
    };

    if (activeSection === 'poster') {
        return (
            <div className="full-screen-editor">
                <div className="editor-header-minimal">
                    <button className="btn-back" onClick={() => setActiveSection('editor')}>← Back to Guide</button>
                    <h2>Poster Designer</h2>
                    <span></span>
                </div>
                <PosterEditor onSave={handlePosterSave} initialData={data.posterData} />
            </div>
        );
    }

    if (activeSection === 'presentation') {
        return (
            <PresentationMode
                title={data.title}
                description={data.description}
                steps={data.steps}
                onClose={() => setActiveSection('editor')}
            />
        );
    }

    return (
        <div className="editor-container instructables-theme">
            <nav className="editor-nav">
                <div className="container editor-nav-flex">
                    <div className="editor-breadcrumb">
                        <span className="crumb-link" onClick={() => onNavigate('dashboard')}>Dashboard</span>
                        <span className="separator">/</span>
                        <span className="crumb-current">{data.title}</span>
                    </div>
                    <div className="save-status">
                        {isSaving ? (
                            <span className="saving"><span className="dot-pulse"></span> Saving...</span>
                        ) : (
                            <span className="saved">Saved at {lastSaved}</span>
                        )}
                    </div>
                    <div className="editor-actions">
                        <button className="btn-secondary" onClick={() => setActiveSection('presentation')}>View Presentation</button>
                        <button className="btn-secondary" onClick={() => setActiveSection('poster')}>Design Poster</button>
                        <button className="btn-primary" onClick={handlePublish}>Publish Guide</button>
                    </div>
                </div>
            </nav>

            <main className="container editor-layout-unified">
                <div className="editor-sidebar-fixed">
                    <div className="metadata-card">
                        <h3>Project Info</h3>
                        <div className="input-group">
                            <label>Difficulty</label>
                            <select
                                value={data.difficulty}
                                onChange={e => setData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                            >
                                <option value="easy">Easy</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Time Required</label>
                            <input
                                type="text"
                                placeholder="e.g. 2 hours"
                                value={data.timeEstimated}
                                onChange={e => setData(prev => ({ ...prev, timeEstimated: e.target.value }))}
                            />
                        </div>
                        <div className="input-group">
                            <label>Category</label>
                            <input
                                type="text"
                                placeholder="Workshop, Electronics, etc."
                                value={data.category}
                                onChange={e => setData(prev => ({ ...prev, category: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="editor-content-flow">
                    <div className="doc-section header-section">
                        <input
                            className="huge-title-input"
                            placeholder="Give your project a name..."
                            value={data.title}
                            onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <textarea
                            className="guide-description-input"
                            placeholder="What did you make? Tell the story of your project..."
                            value={data.description}
                            onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="doc-section materials-section">
                        <h2>📦 Materials & Tools</h2>
                        <div className="materials-grid-editor">
                            {data.materials.map((m, i) => (
                                <div key={i} className="material-item-edit">
                                    <input
                                        placeholder="Add a material..."
                                        value={m}
                                        onChange={e => {
                                            const newM = [...data.materials];
                                            newM[i] = e.target.value;
                                            setData(prev => ({ ...prev, materials: newM }));
                                        }}
                                    />
                                    <button className="delete-mini" onClick={() => {
                                        const newM = data.materials.filter((_, idx) => idx !== i);
                                        setData(prev => ({ ...prev, materials: newM.length ? newM : [''] }));
                                    }}>✕</button>
                                </div>
                            ))}
                            <button onClick={addMaterial} className="btn-add-ghost">+ Add Material</button>
                        </div>
                    </div>

                    <div className="doc-section steps-section">
                        <h2>🛠️ Step-by-Step Guide</h2>
                        <div className="steps-flow-editor">
                            {data.steps.map((step, i) => (
                                <div key={step.id} className="step-card-unified">
                                    <div className="step-count">Step {i + 1}</div>
                                    <div className="step-edit-grid">
                                        <div className="step-text-area">
                                            <textarea
                                                placeholder="What did you do in this step?"
                                                value={step.text}
                                                onChange={e => {
                                                    const newS = [...data.steps];
                                                    newS[i] = { ...newS[i], text: e.target.value };
                                                    setData(prev => ({ ...prev, steps: newS }));
                                                }}
                                            />
                                        </div>
                                        <div className="step-media-area">
                                            <label className="unified-upload">
                                                {step.image ? (
                                                    <div className="preview-container">
                                                        <img src={step.image} alt="Step preview" />
                                                        <div className="change-hint">Change Photo</div>
                                                    </div>
                                                ) : (
                                                    <div className="upload-empty">
                                                        <span className="icon">📸</span>
                                                        <span>Add Photo</span>
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
                                    </div>
                                    <button className="btn-delete-step" onClick={() => {
                                        const newS = data.steps.filter(s => s.id !== step.id);
                                        setData(prev => ({ ...prev, steps: newS.length ? newS : [{ id: '1', text: '' }] }));
                                    }}>Remove this step</button>
                                </div>
                            ))}
                            <button onClick={addStep} className="btn-add-step-large">+ Add Next Step</button>
                        </div>
                    </div>

                    <div className="doc-section publishing-footer">
                        <div className="publish-card">
                            <h3>Ready to share?</h3>
                            <p>Publishing will make your guide public in the community portfolio.</p>
                            <button className="btn-primary btn-publish" onClick={handlePublish}>Publish to Community</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectEditor;
