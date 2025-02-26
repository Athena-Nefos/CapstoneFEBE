import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Search() {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedMovies, setSavedMovies] = useState([]);
    
    const YOUR_API_KEY = import.meta.env.VITE_API_KEY;
    const { token, isAuthenticated } = useContext(AuthContext);

    // Set token in axios headers ONLY for backend calls
    const setAuthToken = () => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
    };

    // Clear auth headers for external API calls
    const clearAuthHeaders = () => {
        delete axios.defaults.headers.common['x-auth-token'];
    };

    // Fetch already saved movies to check against search results
    useEffect(() => {
        const fetchSavedMovies = async () => {
            if (!isAuthenticated) {
                return;
            }

            try {
                // Set auth token for backend request
                setAuthToken();
                
                const response = await axios.get('http://localhost:3001/api/movies');
                const imdbIds = response.data.map(movie => movie.imdbID);
                setSavedMovies(imdbIds);
            } catch (error) {
                console.error('Error fetching saved movies:', error);
                if (error.response && error.response.status === 401) {
                    setError("Please log in to view your saved movies");
                }
            }
        };
        
        fetchSavedMovies();
    }, [token, isAuthenticated]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Clear auth headers before making request to OMDB
            clearAuthHeaders();
            
            // Create a new axios instance without default headers
            const omdbAxios = axios.create();
            
            const response = await omdbAxios.get(`https://www.omdbapi.com/?s=${query}&apikey=${YOUR_API_KEY}`);
            
            if (response.data.Response === 'True') {
                setSearchResults(response.data.Search);
            } else {
                setError(response.data.Error);
                setSearchResults([]);
            }
        } catch (error) {
            setError('An error occurred while searching');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMovie = async (movie) => {
        if (!isAuthenticated) {
            setError("Please log in to save movies");
            return;
        }

        try {
            // First get movie details (without auth headers)
            clearAuthHeaders();
            const omdbAxios = axios.create();
            const detailsResponse = await omdbAxios.get(
                `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${YOUR_API_KEY}`
            );

            const movieData = {
                title: movie.Title,
                imdbID: movie.imdbID,
                year: movie.Year,
                poster: movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.png',
                genre: detailsResponse.data.Genre,
                plot: detailsResponse.data.Plot,
                rating: detailsResponse.data.imdbRating ? parseFloat(detailsResponse.data.imdbRating) : 0,
                watchStatus: 'Want to Watch',
                userNotes: ''
            };

            // Set auth token for backend request
            setAuthToken();
            
            // Save to database
            await axios.post('http://localhost:3001/api/movies', movieData);

            // Update state
            setSavedMovies([...savedMovies, movie.imdbID]);

        } catch (error) {
            console.error('Error saving movie:', error);
            if (error.response && error.response.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else if (error.message.includes('Network Error')) {
                setError("Network error. Please check your connection or if the server is running.");
            } else {
                setError(`Error saving movie: ${error.message}`);
            }
        }
    };

    return (
        <div className="search-page">
            <h1>Search Movies</h1>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title..."
                    className="search-input"
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            <div className="search-results">
                {searchResults.length > 0 ? (
                    <div className="movie-grid">
                        {searchResults.map(movie => (
                            <div key={movie.imdbID} className="movie-card">
                                <img 
                                    src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.png'} 
                                    alt={movie.Title}
                                    className="movie-poster"
                                    onError={(e) => {
                                        e.target.src = '/placeholder.png';
                                    }}
                                />
                                <div className="movie-info">
                                    <h3>{movie.Title}</h3>
                                    <p>Year: {movie.Year}</p>
                                    <div className="card-actions">
                                        <button
                                            onClick={() => handleSaveMovie(movie)}
                                            disabled={!isAuthenticated || savedMovies.includes(movie.imdbID)}
                                            className="btn btn-success"
                                        >
                                            {!isAuthenticated ? 'Login to Save' : 
                                                savedMovies.includes(movie.imdbID) ? 'Saved' : 'Add to Collection'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && query && (
                    <p className="no-results">No movies found. Try another search.</p>
                )}
            </div>
        </div>
    );
}

export default Search;