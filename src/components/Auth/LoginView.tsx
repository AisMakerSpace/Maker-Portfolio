import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { setCurrentUser, getAllUsers } from '../../utils/gamification';
import type { User } from '../../utils/gamification';
import './LoginView.css';

interface LoginViewProps {
    onLoginSuccess: () => void;
    onClose: () => void;
}

const LoginView = ({ onLoginSuccess, onClose }: LoginViewProps) => {
    const mockUsers = getAllUsers();

    const handleLoginSuccess = (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);

            const newUser: User = {
                id: decoded.sub,
                username: decoded.name,
                email: decoded.email,
                avatar: decoded.picture,
                points: 0,
                badges: [],
                isMock: false
            };

            setCurrentUser(newUser);
            onLoginSuccess();
        } catch (error) {
            console.error('Login failed:', error);
            alert('Failed to process Google Login. Please try again.');
        }
    };

    const selectMockAccount = (user: User) => {
        setCurrentUser(user);
        onLoginSuccess();
    };

    return (
        <div className="login-overlay" onClick={onClose}>
            <div className="login-card animate-in" onClick={(e) => e.stopPropagation()}>
                <button className="login-close" onClick={onClose}>✕</button>

                <div className="login-header">
                    <span className="login-logo">☀️</span>
                    <h1>Sign in to MakerPort</h1>
                    <p>Connect with other makers and share your creative journey.</p>
                </div>

                <div className="login-body">
                    <div className="google-login-container">
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={() => {
                                console.log('Login Failed');
                                alert('Google Login Failed');
                            }}
                            useOneTap
                            theme="outline"
                            size="large"
                            width="100%"
                        />
                    </div>

                    <div className="login-divider">
                        <span>Or continue with Demo Mode</span>
                    </div>

                    <div className="account-picker-mini">
                        <p className="picker-hint">Quick switch for testing:</p>
                        <div className="picker-list-mini">
                            {mockUsers.map(user => (
                                <div key={user.id} className="picker-item-mini" onClick={() => selectMockAccount(user)}>
                                    <img src={user.avatar} alt={user.username} className="picker-avatar-mini" />
                                    <span>{user.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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
