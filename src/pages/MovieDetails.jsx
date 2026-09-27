import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addReview, deleteMovie, deleteReview, getGenres, getMovieById, getReviews, isOffline, updateReview } from "../services/api";
import Loading from "../components/Loading";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import StatusBanner from "../components/StatusBanner";
import { useAuth } from "../context/AuthContext";
import { getMovieGenreIds } from "../utils/movieGenres";
import { formatDuration } from "../utils/duration";
import { calculateOverallRating } from "../utils/rating";

function MovieDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [movieData, genreData, reviewData] = await Promise.all([
        getMovieById(id),
        getGenres(),
        getReviews(id)
      ]);

      setMovie(movieData);
      setGenres(genreData || []);
      setReviews(reviewData || []);
      setOffline(isOffline());
    } catch (err) {
      setError(err.message || "Unable to load movie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${movie?.title}"?`)) return;
    await deleteMovie(id);
    navigate("/movies");
  };

  const handleReview = async (review) => {
    const created = await addReview(review);
    setReviews((current) => [...current, created]);
  };

  const handleReviewUpdate = async (reviewId, changes) => {
    const updated = await updateReview(reviewId, changes);
    setReviews((current) => current.map((review) => review.id === reviewId ? updated : review));
  };

  const handleReviewDelete = async (reviewId) => {
    await deleteReview(reviewId);
    setReviews((current) => current.filter((review) => review.id !== reviewId));
  };

  if (loading) return <Loading />;
  if (!movie) return <div className="empty-state">Movie not found.</div>;

  const genreName = getMovieGenreIds(movie)
    .map((genreId) => genres.find((genre) => String(genre.id) === String(genreId))?.name)
    .filter(Boolean)
    .join(", ") || "Unknown";
  const overallRating = calculateOverallRating(movie.rating, reviews);

  return (
    <section>
      <StatusBanner offline={offline} />
      {error && <div className="error-box">{error}</div>}

      <div className="detail-actions">
        <Link to="/movies" className="button button-secondary">Back</Link>
        {currentUser.role === "admin" && <div>
          <Link to={`/movies/${id}/edit`} className="button button-secondary">Edit</Link>
          <button onClick={handleDelete} className="button button-danger">Delete</button>
        </div>}
      </div>

      <article className="detail-card">
        <img src={movie.poster} alt={`${movie.title} poster`} className="detail-poster" />
        <div className="detail-content">
          <span className="badge">{genreName}</span>
          <h1>{movie.title}</h1>
          <div className="detail-rating">Overall rating: {overallRating.toFixed(1)} / 10</div>
          <div className="specs">
            <span>Year: {movie.releaseYear}</span>
            <span>Duration: {formatDuration(movie.duration)}</span>
            <span>Genre: {genreName}</span>
          </div>
          <p>{movie.description}</p>
        </div>
      </article>

      <section className="panel reviews-section">
        <h2>Reviews ({reviews.length})</h2>
        <ReviewList reviews={reviews} onUpdated={handleReviewUpdate} onDeleted={handleReviewDelete} />
        <ReviewForm movieId={id} onAdded={handleReview} />
      </section>
    </section>
  );
}

export default MovieDetails;
