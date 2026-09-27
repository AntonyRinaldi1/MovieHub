export function getMovieGenreIds(movie) {
  return movie?.genreIds?.length ? movie.genreIds : movie?.genreId ? [movie.genreId] : [];
}