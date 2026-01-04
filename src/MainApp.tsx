import { useState, useEffect } from 'react';
import Landing from './App';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectEditor from './components/Editor/ProjectEditor';
import PublicPortfolio from './components/PublicPortfolio/PublicPortfolio';
import LoginView from './components/Auth/LoginView';
import { getCurrentUser } from './utils/gamification';
import type { User } from './utils/gamification';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config';

function MainApp() {
    console.log('🎯 MainApp is rendering!');
    const [view, setView] = useState<'landing' | 'dashboard' | 'editor' | 'portfolio'>('landing');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [user, setUser] = useState<User | null>(getCurrentUser());

    useEffect(() => {
        // Update user state when view changes potentially affecting auth
        setUser(getCurrentUser());
    }, [view, showLogin]);

    const navigateTo = (newView: 'landing' | 'dashboard' | 'editor' | 'portfolio', projectId?: string) => {
        // Protect dashboard and editor
        if ((newView === 'dashboard' || newView === 'editor') && !user) {
            setShowLogin(true);
            return;
        }

        setEditingProjectId(projectId || null);
        setView(newView);
        window.scrollTo(0, 0);
    };

    const handleLoginSuccess = () => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setShowLogin(false);
        // If we were trying to go somewhere, go there now
        if (view === 'landing') setView('dashboard');
    };

    const renderView = () => {
        switch (view) {
            case 'portfolio': return <PublicPortfolio onNavigate={navigateTo} />;
            case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
            case 'editor': return <ProjectEditor onNavigate={navigateTo} projectId={editingProjectId} />;
            default: return <Landing onNavigate={navigateTo} onShowLogin={() => setShowLogin(true)} />;
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="main-app-host">
                {showLogin && (
                    <LoginView
                        onLoginSuccess={handleLoginSuccess}
                        onClose={() => setShowLogin(false)}
                    />
                )}
                {renderView()}
            </div>
        </GoogleOAuthProvider>
    );
}

export default MainApp;
