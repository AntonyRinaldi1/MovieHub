import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addGenre, deleteGenre, getGenres, getMovies } from "../services/api";
import Loading from "../components/Loading";
import StatusBanner from "../components/StatusBanner";
import { isOffline } from "../services/api";
import { getMovieGenreIds } from "../utils/movieGenres";

const suggestedGenres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
];

function GenreManager() {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [name, setName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");
  const [genresAdded, setGenresAdded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [genreData, movieData] = await Promise.all([getGenres(), getMovies()]);
      setGenres(genreData || []);
      setMovies(movieData || []);
      setOffline(isOffline());
    } catch (err) {
      setError(err.message || "Unable to load genres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    const names = [...new Set([
      ...selectedGenres,
      ...name
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    ])];

    if (!names.length) {
      setError("Enter at least one genre name.");
      return;
    }

    const existingNames = new Set(genres.map((genre) => genre.name.trim().toLowerCase()));
    const newNames = names.filter((item) => !existingNames.has(item.toLowerCase()));

    if (!newNames.length) {
      setError("All entered genres already exist.");
      return;
    }

    const created = await Promise.all(newNames.map((item) => addGenre({ name: item })));
    setGenres((current) => [...current, ...created]);
    setName("");
    setSelectedGenres([]);
    setGenresAdded(true);
    setError(`${created.length} genre${created.length === 1 ? "" : "s"} added successfully.`);
  };

  const handleDelete = async (id) => {
    const used = movies.some((movie) => getMovieGenreIds(movie).some((genreId) => String(genreId) === String(id)));

    if (used) {
      setError("This genre is assigned to a movie and cannot be deleted.");
      return;
    }

    if (!window.confirm("Delete this genre?")) return;

    await deleteGenre(id);
    setGenres((current) => current.filter((genre) => String(genre.id) !== String(id)));
  };

  if (loading) return <Loading />;

  return (
    <section>
      <StatusBanner offline={offline} />

      <div className="page-heading">
        <div>
          <p className="eyebrow">Categories</p>
          <h1>Genre Manager</h1>
          <p className="muted">Organize your movie categories.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {genresAdded && <Link to="/" className="button button-secondary">View Dashboard Tiles</Link>}

      <div className="genre-manager">
        <form className="panel add-genre" onSubmit={handleAdd}>
          <h2>Add Genres</h2>
          <p className="muted">Select one or more genres, or enter custom names below.</p>
          <div className="genre-options">
            {suggestedGenres.map((genre) => {
              const exists = genres.some((item) => item.name.toLowerCase() === genre.toLowerCase());
              const selected = selectedGenres.includes(genre);
              return (
                <button
                  type="button"
                  key={genre}
                  className={`genre-option${selected ? " selected" : ""}`}
                  disabled={exists}
                  onClick={() => setSelectedGenres((current) => selected
                    ? current.filter((item) => item !== genre)
                    : [...current, genre]
                  )}
                >
                    {genre}{exists ? " (added)" : selected ? " (selected)" : " +"}
                </button>
              );
            })}
          </div>
          <textarea
            rows="5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom: Documentary, Mystery, Drama"
          />
          <button className="button button-primary">Add Genres</button>
        </form>

        <div className="panel">
          <h2>All Genres</h2>
          <div className="genre-list">
            {genres.map((genre) => {
              const count = movies.filter((movie) => getMovieGenreIds(movie).some((id) => String(id) === String(genre.id))).length;
              return (
                <div className="genre-item" key={genre.id}>
                  <div>
                    <strong>{genre.name}</strong>
                    <small>{count} movie(s)</small>
                  </div>
                  <button className="button button-danger small" onClick={() => handleDelete(genre.id)}>
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GenreManager;