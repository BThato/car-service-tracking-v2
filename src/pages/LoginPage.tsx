import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        navigate('/dashboard');
      } else if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        navigate('/confirm', { state: { email } });
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'UserNotConfirmedException') {
        setError('Please confirm your email first. Check your inbox for the verification code.');
      } else if (error.name === 'NotAuthorizedException') {
        setError('Incorrect email or password.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-left">
          <div className="auth-panel-overlay">
            <h2 className="auth-panel-title">Your Car, Our Care</h2>
            <p className="auth-panel-subtitle">Track your vehicle's service in real-time. Know exactly when your car is ready.</p>
            <div className="auth-features">
              <div className="auth-feature-item">
                <span>{'\u{1F527}'}</span>
                <span>Live service stage tracking</span>
              </div>
              <div className="auth-feature-item">
                <span>{'\u{1F4F1}'}</span>
                <span>Real-time notifications</span>
              </div>
              <div className="auth-feature-item">
                <span>{'\u{1F4CB}'}</span>
                <span>Complete service history</span>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-panel-right">
          <div className="auth-car-animation">{'\u{1F697}'}</div>
          <h1>Car Service Tracker</h1>
          <h2>Welcome back! Sign in to continue.</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary btn-full ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
