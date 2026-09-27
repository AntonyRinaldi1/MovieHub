import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMovies } from "../hooks/useMovies";
import Loading from "../components/Loading";
import StatusBanner from "../components/StatusBanner";
import { useAuth } from "../context/AuthContext";
import { getMovieGenreIds } from "../utils/movieGenres";
import { getReviews, getSeries, isOffline } from "../services/api";
import { calculateAverageReviewRating, calculateOverallRating } from "../utils/rating";

function Dashboard() {
  const { currentUser } = useAuth();
  const { movies, genres, loading, offline, error } = useMovies();
  const [series, setSeries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesOffline, setSeriesOffline] = useState(false);

  useEffect(() => {
    Promise.all([getSeries(), getReviews()]).then(([data, reviewData]) => {
      const reviews = reviewData || [];
      setReviews(reviews);
      setSeries((data || []).map((item) => ({
        ...item,
        rating: calculateOverallRating(item.rating, reviews.filter((review) => String(review.seriesId) === String(item.id)))
      })));
      setSeriesOffline(isOffline());
      setSeriesLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const highest = movies.reduce(
      (best, movie) => !best || Number(movie.rating) > Number(best.rating) ? movie : best,
      null
    );

    const highestSeries = series.reduce(
      (best, item) => !best || Number(item.rating) > Number(best.rating) ? item : best,
      null
    );

    const averageRating = calculateAverageReviewRating(
      reviews,
      [...movies, ...series].map((item) => item.rating)
    );

    const counts = genres.map((genre) => ({
      ...genre,
      count: movies.filter((movie) => getMovieGenreIds(movie).some((id) => String(id) === String(genre.id))).length
    }));

    const topMovies = [...movies].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);
    const topSeries = [...series].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);

    return { averageRating, highest, highestSeries, counts, topMovies, topSeries };
  }, [movies, genres, series, reviews]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return [
      ...movies
        .filter((movie) => movie.title.toLowerCase().includes(query))
        .map((movie) => ({ id: movie.id, title: movie.title, type: "Movie", path: `/movies/${movie.id}` })),
      ...series
        .filter((item) => item.title.toLowerCase().includes(query))
        .map((item) => ({ id: item.id, title: item.title, type: "Series", path: `/series/${item.id}` }))
    ];
  }, [movies, search, series]);

  if (loading || seriesLoading) return <Loading />;

  return (
    <section>
      <StatusBanner offline={offline || seriesOffline} />
      {error && <div className="error-box">{error}</div>}

      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Entertainment Dashboard</h1>
          <p className="muted">Track your movie library and audience ratings.</p>
        </div>
        {currentUser.role === "admin" && <Link to="/movies/add" className="button button-primary">+ Add Movie</Link>}
      </div>

      <div className="universal-search">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search movies and series..."
          aria-label="Search movies and series"
        />
        {search.trim() && (
          <div className="universal-search-results">
            {searchResults.length ? searchResults.map((result) => (
              <Link to={result.path} className="universal-search-result" key={`${result.type}-${result.id}`}>
                <strong>{result.title}</strong>
                <span>{result.type}</span>
              </Link>
            )) : <p className="muted">No movies or series found.</p>}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <Link to="/movies" className="stat-card dashboard-link-card"><span>Movies</span><p>Total Movies</p><strong>{movies.length}</strong></Link>
        <Link to="/movies" className="stat-card dashboard-link-card"><span>Audience</span><p>Average Rating</p><strong>{stats.averageRating.toFixed(1)} / 10</strong></Link>
        <Link to="/series" className="stat-card dashboard-link-card"><span>Series</span><p>Total Series</p><strong>{series.length}</strong></Link>
        <Link to={stats.highest ? `/movies/${stats.highest.id}` : "/movies"} className="stat-card dashboard-link-card">
          <span>Top Movie</span>
          <p>Highest Rated</p>
          <strong>{stats.highest?.rating ?? "-"}</strong>
          <small>{stats.highest?.title ?? "No movies"}</small>
        </Link>
        <Link to={stats.highestSeries ? `/series/${stats.highestSeries.id}` : "/series"} className="stat-card dashboard-link-card">
          <span>Top Series</span>
          <p>Highest Rated</p>
          <strong>{stats.highestSeries?.rating ?? "-"}</strong>
          <small>{stats.highestSeries?.title ?? "No series"}</small>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Movies by Genre</h2>
            {currentUser.role === "admin" && <Link to="/genres">Manage</Link>}
          </div>

          <div className="genre-bars">
            {stats.counts.map((genre) => (
              <Link to={`/movies?genre=${encodeURIComponent(genre.id)}`} className="genre-row" key={genre.id}>
                <div><span>{genre.name}</span><strong>{genre.count}</strong></div>
                <div className="bar"><span style={{ width: `${movies.length ? (genre.count / movies.length) * 100 : 0}%` }} /></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel ranking-panel">
          <p className="eyebrow">Top 3 Movies</p>
          <div className="ranking-list">
            {stats.topMovies.map((movie, index) => {
              const movieGenres = getMovieGenreIds(movie)
                .map((id) => genres.find((genre) => String(genre.id) === String(id))?.name)
                .filter(Boolean)
                .join(", ") || "Unknown genre";
              return (
                <Link to={`/movies/${movie.id}`} className="ranking-item" key={movie.id}>
                  <strong>#{index + 1} {movie.title}</strong>
                  <p>{movieGenres} · Rating: {Number(movie.rating).toFixed(1)} / 10</p>
                </Link>
              );
            })}
            {!stats.topMovies.length && <p>No movies available.</p>}
          </div>
        </div>

        <div className="panel ranking-panel">
          <p className="eyebrow">Top 3 Series</p>
          <div className="ranking-list">
            {stats.topSeries.map((item, index) => (
              <Link to={`/series/${item.id}`} className="ranking-item" key={item.id}>
                <strong>#{index + 1} {item.title}</strong>
                <p>Series · Rating: {Number(item.rating).toFixed(1)} / 10</p>
              </Link>
            ))}
            {!stats.topSeries.length && <p>No series available.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
