import { useState, useEffect } from 'react';
import './ProjectEditor.css';

interface ProjectData {
    title: string;
    description: string;
    materials: string[];
    steps: { id: string; text: string; image?: string }[];
}

interface EditorProps {
    onNavigate: (view: 'landing' | 'dashboard' | 'editor') => void;
}

const ProjectEditor = ({ onNavigate }: EditorProps) => {
    const [data, setData] = useState<ProjectData>({
        title: 'New Maker Project',
        description: '',
        materials: [''],
        steps: [{ id: '1', text: '' }]
    });

    const [lastSaved, setLastSaved] = useState<string>('Never');
    const [isSaving, setIsSaving] = useState(false);

    // Simple Auto-save simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            saveProject();
        }, 2000);
        return () => clearTimeout(timer);
    }, [data]);

    const saveProject = () => {
        setIsSaving(true);
        // In a real app, this would hit an API
        localStorage.setItem('maker-temp-project', JSON.stringify(data));
        setTimeout(() => {
            setLastSaved(new Date().toLocaleTimeString());
            setIsSaving(false);
        }, 500);
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
                        <button className="btn-secondary">Preview Poster</button>
                        <button className="btn-primary">Publish Portfolio</button>
                    </div>
                </div>
            </nav>

            <main className="container editor-layout">
                <aside className="editor-sidebar">
                    <div className="sections-list">
                        <div className="section-item active">Project Info</div>
                        <div className="section-item">Materials List</div>
                        <div className="section-item">Process Steps</div>
                        <div className="section-item">Final Gallery</div>
                    </div>
                </aside>

                <section className="editor-main-content">
                    <div className="editor-card">
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

                        <div className="editor-divider"></div>

                        <div className="editor-section">
                            <h4>Materials Used</h4>
                            {data.materials.map((m, i) => (
                                <input
                                    key={i}
                                    className="list-input"
                                    placeholder="e.g. 3D Printed Chassis"
                                    value={m}
                                    onChange={e => {
                                        const newM = [...data.materials];
                                        newM[i] = e.target.value;
                                        setData(prev => ({ ...prev, materials: newM }));
                                    }}
                                />
                            ))}
                            <button onClick={addMaterial} className="add-btn">+ Add Material</button>
                        </div>

                        <div className="editor-divider"></div>

                        <div className="editor-section">
                            <h4>Building Steps</h4>
                            {data.steps.map((step, i) => (
                                <div key={step.id} className="step-input-group">
                                    <span className="step-num">{i + 1}</span>
                                    <textarea
                                        placeholder="Describe this step..."
                                        value={step.text}
                                        onChange={e => {
                                            const newS = [...data.steps];
                                            newS[i] = { ...newS[i], text: e.target.value };
                                            setData(prev => ({ ...prev, steps: newS }));
                                        }}
                                    />
                                    <label className="step-image-upload">
                                        {step.image ? (
                                            <img src={step.image} alt="Step preview" className="step-preview-img" />
                                        ) : (
                                            <span>📸 Photo</span>
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
                            <button onClick={addStep} className="add-btn">+ Add Next Step</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProjectEditor;
