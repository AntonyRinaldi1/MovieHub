import { Link } from "react-router-dom";
import { formatDuration } from "../utils/duration";

function MovieCard({ movie, genreName = "Unknown" }) {
  return (
    <article className="movie-card">
      <img
        src={movie.poster}
        alt={`${movie.title} poster`}
        className="movie-poster"
        loading="lazy"
      />
      <div className="movie-card-body">
        <div className="movie-card-top">
          <span className="badge">{genreName}</span>
          <span className="rating">Rating: {Number(movie.rating).toFixed(1)}</span>
        </div>
        <h3>{movie.title}</h3>
        <p className="muted">{movie.releaseYear} | {formatDuration(movie.duration)}</p>
        <p className="description">{movie.description}</p>
        <Link to={`/movies/${movie.id}`} className="button button-primary full">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default MovieCard;
