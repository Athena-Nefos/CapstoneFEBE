import { useState, useEffect } from 'react';
import axios from 'axios';

function Search() {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedMovies, setSavedMovies] = useState([]);
    
    const YOUR_API_KEY = import.meta.env.VITE_API_KEY;

  // Fetch already saved movies to check against search results
    useEffect(() => {
    const fetchSavedMovies = async () => {
        try {
        const response = await axios.get('http://localhost:3001/api/movies');
        const imdbIds = response.data.map(movie => movie.imdbID);
        setSavedMovies(imdbIds);
        } catch (error) {
        console.error('Error fetching saved movies:', error);
        }
    };
    
    fetchSavedMovies();
    }, []);

    const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=${YOUR_API_KEY}`);
        
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
    try {
      // Get additional details from OMDB API
        const detailsResponse = await axios.get(
        `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${YOUR_API_KEY}`
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

      // Save to database
        await axios.post('http://localhost:3001/api/movies', movieData);

      // Update state
        setSavedMovies([...savedMovies, movie.imdbID]);

    } catch (error) {
        console.error('Error saving movie:', error);
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
                />
                <div className="movie-info">
                    <h3>{movie.Title}</h3>
                    <p>Year: {movie.Year}</p>
                    <div className="card-actions">
                    <button
                        onClick={() => handleSaveMovie(movie)}
                        disabled={savedMovies.includes(movie.imdbID)}
                        className="btn btn-success"
                    >
                        {savedMovies.includes(movie.imdbID) ? 'Saved' : 'Add to Collection'}
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