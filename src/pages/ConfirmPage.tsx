import { useState, FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

function ConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setSuccess('Email confirmed! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Confirmation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendSignUpCode({ username: email });
      setSuccess('A new code has been sent to your email.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to resend code.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-left">
          <div className="auth-panel-overlay">
            <h2 className="auth-panel-title">Almost There!</h2>
            <p className="auth-panel-subtitle">Check your email for the confirmation code we just sent you.</p>
          </div>
        </div>
        <div className="auth-panel-right">
          <h1>Confirm Your Email</h1>
          <h2>Enter the 6-digit code from your inbox</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="code">Confirmation Code</label>
              <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="123456" />
            </div>
            <button type="submit" className={`btn btn-primary btn-full ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
              {isLoading ? 'Confirming...' : 'Confirm Email'}
            </button>
          </form>
          <p className="auth-link">
            <button onClick={handleResend} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
              Resend Code
            </button>
          </p>
          <p className="auth-link">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPage;
