import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovieGenreIds } from "../utils/movieGenres";

const initialValues = {
  title: "",
  genreId: "",
  genreIds: [],
  releaseYear: "",
  rating: "",
  durationHours: "",
  durationMinutes: "",
  poster: "",
  description: ""
};

function MovieForm({ movie, genres, onSubmit }) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title ?? "",
        genreId: movie.genreId ?? "",
        genreIds: getMovieGenreIds(movie).map(String),
        releaseYear: movie.releaseYear ?? "",
        rating: movie.rating ?? "",
        durationHours: movie.duration ? Math.floor(Number(movie.duration) / 60) : "",
        durationMinutes: movie.duration ? Number(movie.duration) % 60 : "",
        poster: movie.poster ?? "",
        description: movie.description ?? ""
      });
    }
  }, [movie]);

  const validate = () => {
    const next = {};
    const currentYear = new Date().getFullYear();

    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.genreIds.length) next.genreId = "Select at least one genre.";

    const year = Number(form.releaseYear);
    if (!form.releaseYear || !Number.isInteger(year) || year < 1888 || year > currentYear + 2) {
      next.releaseYear = `Enter a valid year between 1888 and ${currentYear + 2}.`;
    }

    const rating = Number(form.rating);
    if (form.rating === "" || Number.isNaN(rating) || rating < 0 || rating > 10) {
      next.rating = "Rating must be between 0 and 10.";
    }

    const hours = Number(form.durationHours || 0);
    const minutes = Number(form.durationMinutes || 0);
    if (!Number.isInteger(hours) || hours < 0 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59 || (hours === 0 && minutes === 0)) {
      next.duration = "Enter a valid duration using hours and 0-59 minutes.";
    }

    if (!form.poster.trim()) next.poster = "Poster URL is required.";
    if (!form.description.trim()) next.description = "Description is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const toggleGenre = (genreId) => {
    setForm((current) => {
      const genreIds = current.genreIds.includes(genreId)
        ? current.genreIds.filter((id) => id !== genreId)
        : [...current.genreIds, genreId];
      return { ...current, genreIds, genreId: genreIds[0] || "" };
    });
  };

  const selectedGenreNames = genres
    .filter((genre) => form.genreIds.includes(String(genre.id)))
    .map((genre) => genre.name);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        releaseYear: Number(form.releaseYear),
        rating: Number(form.rating),
        duration: Number(form.durationHours || 0) * 60 + Number(form.durationMinutes || 0),
        genreIds: form.genreIds
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          Title *
          <input name="title" value={form.title} onChange={handleChange} placeholder="Movie title" />
          {errors.title && <small className="error">{errors.title}</small>}
        </label>

        <label>
          Genres *
          <details className="genre-dropdown">
            <summary>{selectedGenreNames.length ? selectedGenreNames.join(", ") : "Select genre"}</summary>
            <div className="genre-dropdown-menu">
              {genres.map((genre) => (
                <label className="genre-dropdown-option" key={genre.id}>
                  <input
                    type="checkbox"
                    checked={form.genreIds.includes(String(genre.id))}
                    onChange={() => toggleGenre(String(genre.id))}
                  />
                  <span>{genre.name}</span>
                </label>
              ))}
            </div>
          </details>
          <small className="field-hint">Click the field to choose one or more genres.</small>
          {errors.genreId && <small className="error">{errors.genreId}</small>}
        </label>

        <label>
          Release Year *
          <input name="releaseYear" type="number" value={form.releaseYear} onChange={handleChange} />
          {errors.releaseYear && <small className="error">{errors.releaseYear}</small>}
        </label>

        <label>
          Rating (0-10) *
          <input name="rating" type="number" min="0" max="10" step="0.1" value={form.rating} onChange={handleChange} />
          {errors.rating && <small className="error">{errors.rating}</small>}
        </label>

        <label>
          Duration *
          <div className="duration-inputs">
            <input name="durationHours" type="number" min="0" value={form.durationHours} onChange={handleChange} placeholder="Hours" />
            <input name="durationMinutes" type="number" min="0" max="59" value={form.durationMinutes} onChange={handleChange} placeholder="Minutes" />
          </div>
          {errors.duration && <small className="error">{errors.duration}</small>}
        </label>

        <label>
          Poster URL *
          <input name="poster" value={form.poster} onChange={handleChange} placeholder="https://..." />
          {errors.poster && <small className="error">{errors.poster}</small>}
        </label>
      </div>

      <label>
        Description *
        <textarea name="description" rows="5" value={form.description} onChange={handleChange} placeholder="Movie description" />
        {errors.description && <small className="error">{errors.description}</small>}
      </label>

      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
        </button>
      </div>
    </form>
  );
}

export default MovieForm;
