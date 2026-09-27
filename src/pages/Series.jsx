import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import StatusBanner from "../components/StatusBanner";
import { getReviews, getSeries, isOffline } from "../services/api";
import { calculateOverallRating } from "../utils/rating";

function Series() {
  const [series, setSeries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([getSeries(), getReviews()]).then(([data, reviewData]) => {
      const reviews = reviewData || [];
      setSeries((data || []).map((item) => ({
        ...item,
        rating: calculateOverallRating(item.rating, reviews.filter((review) => String(review.seriesId) === String(item.id)))
      })));
      setOffline(isOffline());
      setLoading(false);
    });
  }, []);

  const filteredSeries = useMemo(
    () => series.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())),
    [series, search]
  );

  if (loading) return <Loading />;

  return (
    <section>
      <StatusBanner offline={offline} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Series library</p>
          <h1>TV Series</h1>
          <p className="muted">{filteredSeries.length} series available</p>
        </div>
      </div>

      <div className="filters series-filter">
        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search series title..."
        />
      </div>

      {filteredSeries.length ? (
        <div className="series-grid">
          {filteredSeries.map((item) => (
            <article className="movie-card series-card" key={item.id}>
              <img
                className="series-thumbnail"
                src={item.thumbnail || "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80"}
                alt={`${item.title} thumbnail`}
              />
              <div className="movie-card-body">
                <div className="movie-card-top">
                  <span className="badge">TV Series</span>
                  <span className="rating">Rating: {Number(item.rating).toFixed(1)}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="muted">Released {item.releaseDate}</p>
                <p className="description">{item.description || "Series description unavailable."}</p>
                <p className="description series-meta">
                  {item.totalSeasons} season{item.totalSeasons === 1 ? "" : "s"} | {item.totalEpisodes} episode{item.totalEpisodes === 1 ? "" : "s"} | Avg episode {item.avgEpisodeRuntime || "-"} min
                </p>
                <Link to={`/series/${item.id}`} className="button button-primary full">View Details</Link>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="empty-state">No series match your search.</div>}
    </section>
  );
}

export default Series;