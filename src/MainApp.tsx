import React, { useState } from 'react';
import Landing from './App';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectEditor from './components/Editor/ProjectEditor';

function MainApp() {
    const [view, setView] = useState<'landing' | 'dashboard' | 'editor'>('landing');

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <Dashboard />;
            case 'editor': return <ProjectEditor />;
            default: return <Landing />;
        }
    };

    // Temporary navigation logic for the demo
    return (
        <div>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                gap: '10px',
                background: 'rgba(0,0,0,0.8)',
                padding: '10px',
                borderRadius: '30px'
            }}>
                <button onClick={() => setView('landing')} style={{ background: view === 'landing' ? '#FFB800' : 'white', padding: '5px 15px', borderRadius: '20px' }}>Landing</button>
                <button onClick={() => setView('dashboard')} style={{ background: view === 'dashboard' ? '#FFB800' : 'white', padding: '5px 15px', borderRadius: '20px' }}>Dashboard</button>
                <button onClick={() => setView('editor')} style={{ background: view === 'editor' ? '#FFB800' : 'white', padding: '5px 15px', borderRadius: '20px' }}>Editor</button>
            </div>
            {renderView()}
        </div>
    );
}

export default MainApp;
