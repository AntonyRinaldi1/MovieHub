import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ReviewForm({ movieId, seriesId, onAdded }) {
  const { currentUser, recordMovieReview } = useAuth();
  const defaultReviewer = currentUser?.name || "";
  const [form, setForm] = useState({ reviewer: defaultReviewer, rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!form.reviewer.trim() || !form.comment.trim()) {
      setError("Reviewer name and comment are required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onAdded({
        ...(movieId ? { movieId } : { seriesId }),
        reviewer: form.reviewer.trim(),
        reviewerId: currentUser?.email || currentUser?.username,
        rating: Number(form.rating),
        comment: form.comment.trim(),
        date: new Date().toISOString().slice(0, 10)
      });
      if (movieId) recordMovieReview();
      setForm({ reviewer: defaultReviewer, rating: 5, comment: "" });
    } catch (err) {
      setError(err.message || "Unable to submit review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <h3>Write a Review</h3>
      {error && <p className="error">{error}</p>}

      <div className="form-grid">
        <label>
          Your name
          <input value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} />
        </label>

        <label>
          Rating
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}
          </select>
        </label>
      </div>

      <label>
        Comment
        <textarea rows="4" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
      </label>

      <button className="button button-primary" disabled={saving}>
        {saving ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;