import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    
    return (
    <nav className="navbar">
        <div className="navbar-brand">
        <Link to="/">Movie Night Planner</Link>
        </div>
        <ul className="navbar-nav">
        <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">Home</Link>
        </li>
        <li className={location.pathname === '/search' ? 'active' : ''}>
            <Link to="/search">Search</Link>
        </li>
        <li className={location.pathname === '/collection' ? 'active' : ''}>
            <Link to="/collection">Collection</Link>
        </li>
        </ul>
    </nav>
    );
}

export default Navbar;