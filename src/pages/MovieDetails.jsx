import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
    rating: 0,
    watchStatus: 'Want to Watch',
    userNotes: ''
    });

    useEffect(() => {
    const fetchMovieDetails = async () => {
        try {
        const response = await axios.get(`http://localhost:3001/api/movies/${id}`);
        setMovie(response.data);
        setFormData({
            rating: response.data.rating,
            watchStatus: response.data.watchStatus,
            userNotes: response.data.userNotes
        });
        } catch (error) {
        setError('Error fetching movie details');
        console.error('Error fetching movie details:', error);
        } finally {
        setLoading(false);
        }
    };
    
    fetchMovieDetails();
    }, [id]);

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: name === 'rating' ? parseFloat(value) : value
    });
    };

    const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
        const response = await axios.put(`http://localhost:3001/api/movies/${id}`, formData);
        setMovie({...movie, ...response.data});
        setIsEditing(false);
    } catch (error) {
        console.error('Error updating movie:', error);
    }
    };

    const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this movie from your collection?')) {
        try {
        await axios.delete(`http://localhost:3001/api/movies/${id}`);
        navigate('/collection');
        } catch (error) {
        console.error('Error deleting movie:', error);
        }
    }
    };

    if (loading) return <div className="loading">Loading movie details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!movie) return <div className="not-found">Movie not found</div>;

    return (
    <div className="movie-details-page">
        <div className="movie-details-container">
        <div className="movie-poster-section">
            <img src={movie.poster} alt={movie.title} className="detail-poster" />
        </div>
        
        <div className="movie-info-section">
            <h1>{movie.title} <span className="year">({movie.year})</span></h1>
            <div className="movie-metadata">
            <span className="genre">{movie.genre}</span>
            <span className="rating">IMDb: {movie.rating}/10</span>
            </div>

            <div className="plot-section">
            <h3>Plot</h3>
            <p>{movie.plot}</p>
            </div>

            {!isEditing ? (
            <div className="user-data-section">
                <div className="status-section">
                <h3>Watch Status</h3>
                <p className={`status-badge ${movie.watchStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                    {movie.watchStatus}
                </p>
                </div>

                <div className="user-notes-section">
                <h3>Your Notes</h3>
                <p>{movie.userNotes || 'No notes added yet.'}</p>
                </div>

                <div className="action-buttons">
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn btn-secondary"
                >
                    Edit Details
                </button>
                <button 
                        onClick={handleDelete} 
                    className="btn btn-danger"
                >
                    Remove from Collection
                </button>
                </div>
            </div>
            ) : (
            <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                <label htmlFor="rating">Your Rating (0-10)</label>
                <input
                    type="number"
                    id="rating"
                    name="rating"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                />
                </div>

                <div className="form-group">
                <label htmlFor="watchStatus">Watch Status</label>
                <select
                        id="watchStatus"
                    name="watchStatus"
                    value={formData.watchStatus}
                    onChange={handleInputChange}
                >
                    <option value="Want to Watch">Want to Watch</option>
                    <option value="Currently Watching">Currently Watching</option>
                    <option value="Watched">Watched</option>
                </select>
                </div>

                <div className="form-group">
                <label htmlFor="userNotes">Your Notes</label>
                <textarea
                    id="userNotes"
                    name="userNotes"
                    value={formData.userNotes}
                    onChange={handleInputChange}
                    rows="4"
                />
                </div>

                <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
                </div>
            </form>
            )}
        </div>
        </div>
    </div>
    );
}

export default MovieDetails;