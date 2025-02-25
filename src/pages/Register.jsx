import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
    const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
    });
    const { username, email, password, password2 } = formData;

    const [localError, setLocalError] = useState('');
    const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);
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
    
    // Check if passwords match
    if (password !== password2) {
        setLocalError('Passwords do not match');
    } else {
        setLocalError('');
        register({ username, email, password });
    }
    };

    return (
    <div className="auth-page">
        <div className="auth-container">
        <h1>Register</h1>
        <p className="lead">Create your account</p>
        
        {(error || localError) && <div className="error-message">{localError || error}</div>}
        
        <form onSubmit={onSubmit} className="auth-form">
            <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={onChange}
                required
                minLength="3"
            />
            </div>

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

            <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
                type="password"
                id="password2"
                name="password2"
                value={password2}
                onChange={onChange}
                required
                minLength="6"
            />
            </div>

            <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
        
        <p className="auth-redirect">
            Already have an account? <Link to="/login">Login</Link>
        </p>
        </div>
    </div>
    );
}

export default Register;