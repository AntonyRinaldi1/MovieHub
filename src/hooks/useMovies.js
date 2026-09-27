import { useCallback, useEffect, useState } from "react";
import { getMovies, getGenres, getReviews, isOffline } from "../services/api";
import { calculateOverallRating } from "../utils/rating";

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [movieData, genreData, reviewData] = await Promise.all([getMovies(), getGenres(), getReviews()]);
      const reviews = reviewData || [];
      setMovies((movieData || []).map((movie) => ({
        ...movie,
        rating: calculateOverallRating(movie.rating, reviews.filter((review) => String(review.movieId) === String(movie.id)))
      })));
      setGenres(genreData || []);
      setOffline(isOffline());
    } catch (err) {
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { movies, genres, loading, offline, error, refresh };
}