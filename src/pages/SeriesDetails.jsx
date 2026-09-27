import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import StatusBanner from "../components/StatusBanner";
import { deleteSeries, getSeriesById, isOffline } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { addReview, deleteReview, getSeriesReviews, updateReview } from "../services/api";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { calculateOverallRating } from "../utils/rating";

function SeriesDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    Promise.all([getSeriesById(id), getSeriesReviews(id)]).then(([data, reviewData]) => {
      setSeries(data);
      setReviews(reviewData || []);
      setOffline(isOffline());
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${series?.title}"?`)) return;
    await deleteSeries(id);
    navigate("/series");
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
  if (!series) return <div className="empty-state">Series not found.</div>;

  const overallRating = calculateOverallRating(series.rating, reviews);

  return (
    <section>
      <StatusBanner offline={offline} />
      <div className="detail-actions">
        <Link to="/series" className="button button-secondary">Back</Link>
        {currentUser.role === "admin" && <div>
          <Link to={`/series/${id}/edit`} className="button button-secondary">Edit</Link>
          <button onClick={handleDelete} className="button button-danger">Delete</button>
        </div>}
      </div>

      <article className="detail-card">
        <img
          src={series.thumbnail || "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80"}
          alt={`${series.title} thumbnail`}
          className="detail-poster"
        />
        <div className="detail-content">
          <span className="badge">TV Series</span>
          <h1>{series.title}</h1>
          <div className="detail-rating">Overall rating: {overallRating.toFixed(1)} / 10</div>
          <div className="specs">
            <span>Released: {series.releaseDate}</span>
            <span>{series.totalSeasons} season{series.totalSeasons === 1 ? "" : "s"}</span>
            <span>{series.totalEpisodes} episode{series.totalEpisodes === 1 ? "" : "s"}</span>
            <span>Average Runtime: {series.avgEpisodeRuntime || "-"} min</span>
          </div>
          <p>{series.description || "Series description unavailable."}</p>
        </div>
      </article>

      <section className="panel reviews-section">
        <h2>Reviews ({reviews.length})</h2>
        <ReviewList reviews={reviews} subject="this series" onUpdated={handleReviewUpdate} onDeleted={handleReviewDelete} />
        <ReviewForm seriesId={id} onAdded={handleReview} />
      </section>
    </section>
  );
}

export default SeriesDetails;