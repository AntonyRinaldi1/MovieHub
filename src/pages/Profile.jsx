import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMovies, getReviews, getSeries } from "../services/api";

function Profile() {
  const { currentUser, updateProfile, getReviewerRank } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: currentUser.name || "",
    profilePic: currentUser.profilePic || "",
    moviesReviewed: currentUser.moviesReviewed ?? 0
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const reviewerRank = getReviewerRank();
  const [catalogTotal, setCatalogTotal] = useState(0);

  useEffect(() => {
    if (currentUser.role === "admin") {
      Promise.all([getMovies(), getSeries()]).then(([movies, series]) => {
        setCatalogTotal((movies?.length || 0) + (series?.length || 0));
      });
      return;
    }

    getReviews().then((reviews) => {
      const reviewerId = currentUser.email || currentUser.username;
      const reviewCount = (reviews || []).filter((review) => review.reviewerId === reviewerId).length;
      setForm((current) => ({ ...current, moviesReviewed: reviewCount }));
    });
  }, [currentUser.email, currentUser.role, currentUser.username]);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handlePictureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  const clearPicture = () => {
    setForm((current) => ({ ...current, profilePic: "" }));
    updateProfile({ profilePic: "" });
    setSaved(true);
  };

  const submit = (event) => {
    event.preventDefault();
    const moviesReviewed = Number(form.moviesReviewed);
    if (!form.name.trim() || !Number.isInteger(moviesReviewed) || moviesReviewed < 0) {
      setError("Enter a name and a valid reviewed movie count.");
      return;
    }

    updateProfile({
      name: form.name.trim(),
      profilePic: form.profilePic.trim(),
      moviesReviewed
    });
    setSaved(true);
    setError("");
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Your Profile</h1>
          <p className="muted">Manage your MovieHub profile details.</p>
        </div>
      </div>

      <form className="form-card profile-form" onSubmit={submit}>
        <div className="profile-preview">
          {form.profilePic ? <img src={form.profilePic} alt="Profile preview" /> : <span>{form.name.charAt(0).toUpperCase() || "U"}</span>}
        </div>
        {currentUser.role !== "admin" && (
          <div className="profile-rank">
            <strong>Reviewer Rank #{reviewerRank || "-"}</strong>
            <span>Based on movies reviewed</span>
          </div>
        )}
        <div className="form-grid">
          <label>Username *<input name="name" value={form.name} onChange={handleChange} /></label>
          <label>Profile picture URL<input name="profilePic" type="url" value={form.profilePic.startsWith("data:") ? "" : form.profilePic} onChange={handleChange} placeholder="https://..." /></label>
          <div className="profile-image-actions">
            <label>Or upload an image<input type="file" accept="image/*" onChange={handlePictureUpload} /></label>
            <button type="button" className="button button-danger" onClick={clearPicture}>Delete Image</button>
          </div>
          <label>
            {currentUser.role === "admin" ? "Total movies and series added" : "Total titles reviewed"}
            <input name="moviesReviewed" type="number" value={currentUser.role === "admin" ? catalogTotal : form.moviesReviewed} readOnly />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        {saved && <p className="profile-saved">Profile updated.</p>}
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="button button-primary">Save Profile</button>
        </div>
      </form>
    </section>
  );
}

export default Profile;