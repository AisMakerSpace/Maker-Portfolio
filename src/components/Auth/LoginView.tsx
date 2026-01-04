import { useState } from 'react';
import { setCurrentUser, getAllUsers } from '../../utils/gamification';
import type { User } from '../../utils/gamification';
import './LoginView.css';

interface LoginViewProps {
    onLoginSuccess: () => void;
    onClose: () => void;
}

const LoginView = ({ onLoginSuccess, onClose }: LoginViewProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const mockUsers = getAllUsers();

    const handleGoogleLogin = () => {
        setIsLoading(true);
        // Simulate Google Auth delay
        setTimeout(() => {
            setIsLoading(false);
            setShowPicker(true);
        }, 1000);
    };

    const selectAccount = (user: User) => {
        setCurrentUser(user);
        onLoginSuccess();
    };

    return (
        <div className="login-overlay" onClick={onClose}>
            <div className="login-card animate-in" onClick={(e) => e.stopPropagation()}>
                <button className="login-close" onClick={onClose}>✕</button>

                {!showPicker ? (
                    <>
                        <div className="login-header">
                            <span className="login-logo">☀️</span>
                            <h1>Sign in to MakerPort</h1>
                            <p>Connect with other makers and share your creative journey.</p>
                        </div>

                        <div className="login-body">
                            <button
                                className={`btn-google ${isLoading ? 'loading' : ''}`}
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    <>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                                        Sign in with Google
                                    </>
                                )}
                            </button>

                            <div className="login-divider">
                                <span>Demo Mode</span>
                            </div>

                            <p className="demo-hint">Use the button above to simulate a Google Account login. You can test with two different accounts!</p>
                        </div>
                    </>
                ) : (
                    <div className="account-picker">
                        <div className="picker-header">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="mini-g" />
                            <h2>Choose an account</h2>
                            <p>to continue to <strong>MakerPort</strong></p>
                        </div>

                        <div className="picker-list">
                            {mockUsers.map(user => (
                                <div key={user.id} className="picker-item" onClick={() => selectAccount(user)}>
                                    <img src={user.avatar} alt={user.username} className="picker-avatar" />
                                    <div className="picker-info">
                                        <div className="picker-name">{user.username}</div>
                                        <div className="picker-email">{user.email}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="picker-item disabled">
                                <div className="picker-icon">👤</div>
                                <div className="picker-info">
                                    <div className="picker-name">Add another account</div>
                                </div>
                            </div>
                        </div>

                        <div className="picker-footer">
                            <p>To continue, Google will share your name, email address, and profile picture with MakerPort.</p>
                        </div>
                    </div>
                )}

                <div className="login-footer-small">
                    <p>English (United States)</p>
                    <div className="footer-links">
                        <span>Help</span>
                        <span>Privacy</span>
                        <span>Terms</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
