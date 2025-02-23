import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [recentMovies, setRecentMovies] = useState([]);
    const [upcomingWatch, setUpcomingWatch] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
    const fetchData = async () => {
        try {
        const response = await axios.get('http://localhost:5173/api/movies');
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
        } finally {
        setLoading(false);
            }
    };
    
    fetchData();
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
    <div className="home-container">
        <section className="welcome-section">
        <h1>Movie Night Planner</h1>
        <p>Organize your perfect movie night with friends and family</p>
        <div className="action-buttons">
            <Link to="/search" className="btn btn-primary">Find Movies</Link>
            <Link to="/collection" className="btn btn-secondary">View Collection</Link>
        </div>
        </section>

        <section className="recent-additions">
        <h2>Recently Added</h2>
        <div className="movie-grid">
            {recentMovies.length > 0 ? (
            recentMovies.map(movie => (
                <div key={movie._id} className="movie-card">
                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <p>{movie.year}</p>
                    <Link to={`/movie/${movie._id}`} className="btn btn-small">View</Link>
                </div>
                </div>
            ))
            ) : (
            <p>No movies added yet. Start building your collection!</p>
            )}
        </div>
        </section>

        <section className="watch-next">
        <h2>Next on Your Watchlist</h2>
        <div className="movie-grid">
            {upcomingWatch.length > 0 ? (
            upcomingWatch.map(movie => (
                <div key={movie._id} className="movie-card">
                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <p>{movie.year}</p>
                    <Link to={`/movie/${movie._id}`} className="btn btn-small">View</Link>
                </div>
                </div>
            ))
            ) : (
            <p>Your watchlist is empty. Find some movies to add!</p>
            )}
        </div>
        </section>
    </div>
    );
}

export default Home;