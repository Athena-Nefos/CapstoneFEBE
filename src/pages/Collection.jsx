import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Collection() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
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
        const fetchCollection = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            if (token) {
                setAuthToken(token);
            }

            try {
                const response = await axios.get('http://localhost:3001/api/movies');
                setMovies(response.data);
            } catch (error) {
                console.error('Error fetching collection:', error);
                setError('Failed to load your movie collection');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [token, isAuthenticated]);

    const filteredMovies = filter === 'all'
        ? movies
        : movies.filter(movie => movie.watchStatus === filter);

    if (!isAuthenticated) {
        return (
            <div className="collection-page">
                <div className="collection-header">
                    <h1>Your Movie Collection</h1>
                </div>
                <div className="empty-collection">
                    <p>Please log in to view your movie collection.</p>
                    <Link to="/login" className="btn btn-primary">Log In</Link>
                </div>
            </div>
        );
    }

    if (loading) return <div className="loading">Loading your collection...</div>;

    return (
        <div className="collection-page">
            <div className="collection-header">
                <h1>Your Movie Collection</h1>
                <div className="filter-controls">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Movies
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'Want to Watch' ? 'active' : ''}`}
                        onClick={() => setFilter('Want to Watch')}
                    >
                        Want to Watch
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'Currently Watching' ? 'active' : ''}`}
                        onClick={() => setFilter('Currently Watching')}
                    >
                        Currently Watching
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'Watched' ? 'active' : ''}`}
                        onClick={() => setFilter('Watched')}
                    >
                        Watched
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {filteredMovies.length > 0 ? (
                <div className="movie-grid collection-grid">
                    {filteredMovies.map(movie => (
                        <div key={movie._id} className="movie-card">
                            <div className="status-indicator" data-status={movie.watchStatus?.toLowerCase().replace(/\s+/g, '-') || 'none'}></div>
                            <img src={movie.poster} alt={movie.title} className="movie-poster" />
                            <div className="movie-info">
                                <h3>{movie.title}</h3>
                                <p>{movie.year}</p>
                                {movie.rating > 0 && <p className="user-rating">Your rating: {movie.rating}/10</p>}
                                <Link to={`/movie/${movie._id}`} className="btn btn-primary">View Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-collection">
                    <p>No movies found in your collection{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
                    <Link to="/search" className="btn btn-primary">Find Movies</Link>
                </div>
            )}
        </div>
    );
}

export default Collection;