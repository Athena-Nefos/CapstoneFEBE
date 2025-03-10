import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Home() {
    const [recentMovies, setRecentMovies] = useState([]);
    const [upcomingWatch, setUpcomingWatch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, isAuthenticated } = useContext(AuthContext);

    // Set token in axios headers
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated) {
                    // If not authenticated, set empty arrays and stop loading
                    setRecentMovies([]);
                    setUpcomingWatch([]);
                    setLoading(false);
                    return;
                }

                // Set auth token before making request
                if (token) {
                    setAuthToken(token);
                }

                const response = await axios.get('http://localhost:3001/api/movies');
                const allMovies = response.data;
                
                // Get recent additions
                const recent = allMovies.slice(0, 4);
                setRecentMovies(recent);
                
                // Get upcoming watch list
                const upcoming = allMovies
                    .filter(movie => movie.watchStatus === 'Want to Watch')
                    .slice(0, 4);
                setUpcomingWatch(upcoming);
                
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 401) {
                    setError("Please log in to view your movies");
                } else {
                    setError("Error loading movie data");
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [token, isAuthenticated]);

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="home-container">
            <section className="welcome-section">
                <h1 className="header1">Movie Night Planner</h1>
                <p className="header1">Organize your perfect movie night with friends and family</p>
                <div className="action-buttons">
                    <Link to="/search" className="btn btn-primary">Find Movies</Link>
                    <Link to="/collection" className="btn btn-secondary">View Collection</Link>
                    {!isAuthenticated && (
                        <Link to="/login" className="btn btn-accent">Log In</Link>
                    )}
                </div>
            </section>

            {error && (
                <div className="error-message">{error}</div>
            )}

            <section className="recent-additions">
                <h2>Recently Added</h2>
                <div className="movie-grid">
                    {isAuthenticated ? (
                        recentMovies.length > 0 ? (
                            recentMovies.map(movie => (
                                <div key={movie._id} className="movie-card">
                                    <img 
                                        src={movie.poster || '/placeholder.png'} 
                                        alt={movie.title} 
                                        className="movie-poster" 
                                        onError={(e) => {
                                            e.target.src = '/placeholder.png';
                                        }}
                                    />
                                    <div className="movie-info">
                                        <h3>{movie.title}</h3>
                                        <p>{movie.year}</p>
                                        <Link to={`/movie/${movie._id}`} className="btn btn-small">View</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No movies added yet. Start building your collection!</p>
                        )
                    ) : (
                        <p>Log in to view your recently added movies</p>
                    )}
                </div>
            </section>

            <section className="watch-next">
                <h2>Next on Your Watchlist</h2>
                <div className="movie-grid">
                    {isAuthenticated ? (
                        upcomingWatch.length > 0 ? (
                            upcomingWatch.map(movie => (
                                <div key={movie._id} className="movie-card">
                                    <img 
                                        src={movie.poster || '/placeholder.png'} 
                                        alt={movie.title} 
                                        className="movie-poster" 
                                        onError={(e) => {
                                            e.target.src = '/placeholder.png';
                                        }}
                                    />
                                    <div className="movie-info">
                                        <h3>{movie.title}</h3>
                                        <p>{movie.year}</p>
                                        <Link to={`/movie/${movie._id}`} className="btn btn-small">View</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Your watchlist is empty. Find some movies to add!</p>
                        )
                    ) : (
                        <p>Log in to view your watchlist</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;