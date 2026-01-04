import { useState } from 'react';
import Landing from './App';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectEditor from './components/Editor/ProjectEditor';

function MainApp() {
    const [view, setView] = useState<'landing' | 'dashboard' | 'editor'>('landing');

    const navigateTo = (newView: 'landing' | 'dashboard' | 'editor') => {
        setView(newView);
        window.scrollTo(0, 0);
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
            case 'editor': return <ProjectEditor onNavigate={navigateTo} />;
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
