import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
    const [formData, setFormData] = useState({
    email: '',
    password: ''
    });
    const { email, password } = formData;

    const { login, isAuthenticated, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/');
    }
    
    // Clear errors when component unmounts
    return () => {
        if (error) clearErrors();
    };
    }, [isAuthenticated, navigate]);

    const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

        const onSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
    };

    return (
    <div className="auth-page">
        <div className="auth-container">
        <h1>Login</h1>
        <p className="lead">Sign in to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={onSubmit} className="auth-form">
            <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
            />
            </div>

            <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="6"
            />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Login</button>
        </form>
        
        <p className="auth-redirect">
            Don't have an account? <Link to="/register">Register</Link>
        </p>
        </div>
    </div>
    );
}

export default Login;