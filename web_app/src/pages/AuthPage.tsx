import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { tokens } from '../theme/tokens';

export const AuthPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: tokens.color.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: tokens.color.card,
                padding: '40px',
                borderRadius: tokens.radius.card,
                maxWidth: '400px',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: tokens.typography.display,
                    color: tokens.color.text,
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>
                    {isSignUp ? 'Sign Up' : 'Login'}
                </h1>
                <p style={{
                    color: tokens.color.muted,
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: tokens.typography.caption
                }}>
                    {isSignUp ? 'Create your PriceBuddy account' : 'Welcome back to PriceBuddy'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: tokens.color.text,
                            marginBottom: '8px',
                            fontSize: tokens.typography.caption
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: tokens.color.bg,
                                color: tokens.color.text,
                                fontSize: tokens.typography.body
                            }}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: tokens.color.text,
                            marginBottom: '8px',
                            fontSize: tokens.typography.caption
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: tokens.color.bg,
                                color: tokens.color.text,
                                fontSize: tokens.typography.body
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#3F1F1F',
                            border: `1px solid ${tokens.color.danger}`,
                            borderRadius: '8px',
                            marginBottom: '20px',
                            color: tokens.color.danger,
                            fontSize: tokens.typography.caption
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: tokens.color.brand,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: tokens.typography.body,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    color: tokens.color.muted,
                    fontSize: tokens.typography.caption
                }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    {' '}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: tokens.color.brand,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: tokens.typography.caption
                        }}
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};
