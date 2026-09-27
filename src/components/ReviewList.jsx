import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ReviewList({ reviews, subject = "this title", onUpdated, onDeleted }) {
  const { currentUser } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");

  if (!reviews.length) {
    return <p className="empty-state">No reviews yet. Be the first to review {subject}.</p>;
  }

  const currentUserId = currentUser?.email || currentUser?.username;

  const startEditing = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: review.rating, comment: review.comment });
    setError("");
  };

  const saveEdit = async (review) => {
    if (!editForm.comment.trim()) {
      setError("Comment is required.");
      return;
    }

    try {
      await onUpdated(review.id, {
        rating: Number(editForm.rating),
        comment: editForm.comment.trim(),
        date: new Date().toISOString().slice(0, 10)
      });
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to update review.");
    }
  };

  const removeReview = async (review) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await onDeleted(review.id);
    } catch (err) {
      setError(err.message || "Unable to delete review.");
    }
  };

  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <article className="review" key={review.id}>
          {editingId === review.id ? (
            <div className="review-edit-form">
              <label>
                Rating
                <select value={editForm.rating} onChange={(event) => setEditForm({ ...editForm, rating: event.target.value })}>
                  {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                </select>
              </label>
              <label>
                Comment
                <textarea rows="3" value={editForm.comment} onChange={(event) => setEditForm({ ...editForm, comment: event.target.value })} />
              </label>
              {error && <p className="error">{error}</p>}
              <div className="review-actions">
                <button type="button" className="button button-primary small" onClick={() => saveEdit(review)}>Save</button>
                <button type="button" className="button button-secondary small" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="review-head">
                <strong>{review.reviewer}</strong>
                <span className="rating">Rating: {review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
              <small className="muted">{review.date}</small>
              {review.reviewerId === currentUserId && (
                <div className="review-actions">
                  <button type="button" className="button button-secondary small" onClick={() => startEditing(review)}>Edit</button>
                  <button type="button" className="button button-danger small" onClick={() => removeReview(review)}>Delete</button>
                </div>
              )}
            </>
          )}
        </article>
      ))}
      {error && !editingId && <p className="error">{error}</p>}
    </div>
  );
}

export default ReviewList;
