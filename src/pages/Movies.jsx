import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMovies } from "../hooks/useMovies";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import StatusBanner from "../components/StatusBanner";
import { getMovieGenreIds } from "../utils/movieGenres";

function Movies() {
  const { movies, genres, loading, offline } = useMovies();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [year, setYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [sort, setSort] = useState("rating");

  const years = useMemo(
    () => [...new Set(movies.map((movie) => movie.releaseYear))].sort((a, b) => b - a),
    [movies]
  );

  const filteredMovies = useMemo(() => {
    const result = movies.filter((movie) => {
      const titleMatch = movie.title.toLowerCase().includes(search.toLowerCase());
      const genreMatch = !genre || getMovieGenreIds(movie).some((id) => String(id) === String(genre));
      const yearMatch = !year || String(movie.releaseYear) === String(year);
      const ratingMatch = !minRating || Number(movie.rating) >= Number(minRating);
      const durationMatch = !maxDuration || Number(movie.duration) <= Number(maxDuration);
      return titleMatch && genreMatch && yearMatch && ratingMatch && durationMatch;
    });

    return result.sort((a, b) => {
      if (sort === "rating") return Number(b.rating) - Number(a.rating);
      if (sort === "year") return Number(b.releaseYear) - Number(a.releaseYear);
      return a.title.localeCompare(b.title);
    });
  }, [movies, search, genre, year, minRating, maxDuration, sort]);

  const genreName = (movie) => getMovieGenreIds(movie)
    .map((id) => genres.find((item) => String(item.id) === String(id))?.name)
    .filter(Boolean)
    .join(", ") || "Unknown";

  if (loading) return <Loading />;

  return (
    <section>
      <StatusBanner offline={offline} />

      <div className="page-heading">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Movie Catalog</h1>
          <p className="muted">{filteredMovies.length} movie(s) displayed</p>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movie title..."
        />

        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All Years</option>
          {years.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
          <option value="">Any Rating</option>
          {[9, 8, 7, 6, 5].map((rating) => <option key={rating} value={rating}>{rating}.0+ rating</option>)}
        </select>

        <select value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)}>
          <option value="">Any Duration</option>
          <option value="90">Under 90 min</option>
          <option value="120">Under 120 min</option>
          <option value="150">Under 150 min</option>
          <option value="180">Under 180 min</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Sort: Rating</option>
          <option value="year">Sort: Year</option>
          <option value="title">Sort: Title</option>
        </select>

        <button
          type="button"
          className="button button-secondary clear-filters"
          onClick={() => { setSearch(""); setGenre(""); setYear(""); setMinRating(""); setMaxDuration(""); setSort("rating"); }}
        >
          Clear filters
        </button>
      </div>

      {filteredMovies.length ? (
        <div className="movie-grid">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} genreName={genreName(movie)} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No movies match your filters.</div>
      )}
    </section>
  );
}

export default Movies;
