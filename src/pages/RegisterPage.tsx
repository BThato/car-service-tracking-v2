import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            given_name: formData.firstName,
            family_name: formData.lastName,
            phone_number: formData.phone || undefined,
            'custom:role': 'customer',
          },
        },
      });

      if (isSignUpComplete) {
        navigate('/login');
      } else if (nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        navigate('/confirm', { state: { email: formData.email } });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-left auth-panel-left-register">
          <div className="auth-panel-overlay">
            <h2 className="auth-panel-title">Join Thousands of Happy Customers</h2>
            <p className="auth-panel-subtitle">Book services online, track repairs live, and never wonder about your car's status again.</p>
            <div className="auth-features">
              <div className="auth-feature-item">
                <span>{'\u{1F5D3}\uFE0F'}</span>
                <span>Book appointments online</span>
              </div>
              <div className="auth-feature-item">
                <span>{'\u{1F698}'}</span>
                <span>Manage multiple vehicles</span>
              </div>
              <div className="auth-feature-item">
                <span>{'\u{1F514}'}</span>
                <span>Get notified when ready</span>
              </div>
              <div className="auth-feature-item">
                <span>{'\u{1F517}'}</span>
                <span>Share status with family</span>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-panel-right">
          <div className="auth-car-animation">{'\u{1F527}'}</div>
          <h1>Car Service Tracker</h1>
          <h2>Create your account</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+27 82 123 4567" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min 8 characters" />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat password" />
            </div>
            <button
              type="submit"
              className={`btn btn-primary btn-full ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
