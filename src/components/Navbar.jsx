import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const location = useLocation();
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    
    const onLogout = () => {
    logout();
    };

    const authLinks = (
    <>
        <li className={location.pathname === '/' ? 'active' : ''}>
        <Link to="/">Home</Link>
        </li>
        <li className={location.pathname === '/search' ? 'active' : ''}>
        <Link to="/search">Search</Link>
        </li>
        <li className={location.pathname === '/collection' ? 'active' : ''}>
        <Link to="/collection">Collection</Link>
        </li>
        <li>
        <a href="#!" onClick={onLogout}>
            <span className="username">{user && user.username}</span> Logout
        </a>
        </li>
    </>
    );

    const guestLinks = (
    <>
        <li className={location.pathname === '/login' ? 'active' : ''}>
        <Link to="/login">Login</Link>
        </li>
        <li className={location.pathname === '/register' ? 'active' : ''}>
        <Link to="/register">Register</Link>
        </li>
    </>
    );

    return (
    <nav className="navbar">
        <div className="navbar-brand">
        <Link to="/">Movie Night Planner</Link>
        </div>
        <ul className="navbar-nav">
        {isAuthenticated ? authLinks : guestLinks}
        </ul>
    </nav>
    );
}

export default Navbar;