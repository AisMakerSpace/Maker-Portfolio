import { useState } from 'react';
import Landing from './App';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectEditor from './components/Editor/ProjectEditor';
import PublicPortfolio from './components/PublicPortfolio/PublicPortfolio';

function MainApp() {
    const [view, setView] = useState<'landing' | 'dashboard' | 'editor' | 'portfolio'>('landing');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const navigateTo = (newView: 'landing' | 'dashboard' | 'editor' | 'portfolio', projectId?: string) => {
        setEditingProjectId(projectId || null);
        setView(newView);
        window.scrollTo(0, 0);
    };

    const renderView = () => {
        switch (view) {
            case 'portfolio': return <PublicPortfolio onNavigate={navigateTo} />;
            case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
            case 'editor': return <ProjectEditor onNavigate={navigateTo} projectId={editingProjectId} />;
            default: return <Landing onNavigate={navigateTo} />;
        }
    };

    return (
        <div className="main-app-host">
            {renderView()}
        </div>
    );
}

export default MainApp;
