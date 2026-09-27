const API_URL = "http://localhost:3000";

const fallbackData = {
  movies: [
    {
      id: "local-1",
      title: "Offline Demo Movie",
      genreId: "local-1",
      releaseYear: 2024,
      rating: 8.2,
      duration: 120,
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
      description: "The API server is offline, so MovieHub is showing local fallback data."
    }
  ],
  genres: [{ id: "local-1", name: "Demo" }],
  reviews: [],
  series: [
    { id: "local-series-1", title: "Stranger Things", releaseDate: "2016-07-15", rating: 8.7, totalEpisodes: 34, totalSeasons: 4, avgEpisodeRuntime: 51, description: "A group of friends uncover strange experiments and supernatural mysteries in their small town." },
    { id: "local-series-2", title: "The Last of Us", releaseDate: "2023-01-15", rating: 8.8, totalEpisodes: 15, totalSeasons: 2, avgEpisodeRuntime: 58, description: "A hardened survivor and a teenage girl cross a dangerous post-pandemic America." }
  ]
};

let offlineMode = false;

const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    offlineMode = false;
    return await response.json();
  } catch (error) {
    offlineMode = true;
    console.warn("JSON Server unavailable. Using fallback/local state.", error);
    return null;
  }
};

const localStore = {
  get(key) {
    const value = localStorage.getItem(`moviehub_${key}`);
    return value ? JSON.parse(value) : fallbackData[key] ?? [];
  },
  set(key, value) {
    localStorage.setItem(`moviehub_${key}`, JSON.stringify(value));
  }
};

const getCollection = async (key) => {
  const data = await request(`/${key}`);
  if (data !== null) {
    localStore.set(key, data);
    return data;
  }
  return localStore.get(key);
};

const mutateCollection = async (key, method, id, body) => {
  const endpoint = id ? `/${key}/${id}` : `/${key}`;
  const result = await request(endpoint, {
    method,
    body: body ? JSON.stringify(body) : undefined
  });

  if (result !== null) {
    const current = await getCollection(key);
    return result || current;
  }

  let items = localStore.get(key);

  if (method === "POST") {
    const item = { id: crypto.randomUUID(), ...body };
    items = [...items, item];
    localStore.set(key, items);
    return item;
  }

  if (method === "PUT") {
    items = items.map((item) => String(item.id) === String(id) ? { ...item, ...body, id: item.id } : item);
    localStore.set(key, items);
    return items.find((item) => String(item.id) === String(id));
  }

  if (method === "DELETE") {
    items = items.filter((item) => String(item.id) !== String(id));
    localStore.set(key, items);
    return true;
  }

  return null;
};

export const isOffline = () => offlineMode;

export const getMovies = () => getCollection("movies");

export const getSeries = () => getCollection("series");

export const addSeries = (series) => mutateCollection("series", "POST", null, series);

export const getSeriesById = async (id) => {
  const result = await request(`/series/${id}`);
  if (result !== null) return result;
  return localStore.get("series").find((item) => String(item.id) === String(id)) || null;
};

export const updateSeries = (id, series) => mutateCollection("series", "PUT", id, series);

export const deleteSeries = (id) => mutateCollection("series", "DELETE", id);

export const getMovieById = async (id) => {
  const result = await request(`/movies/${id}`);
  if (result !== null) return result;
  return localStore.get("movies").find((movie) => String(movie.id) === String(id)) || null;
};

export const addMovie = (movie) => mutateCollection("movies", "POST", null, movie);

export const updateMovie = (id, movie) => mutateCollection("movies", "PUT", id, movie);

export const deleteMovie = async (id) => mutateCollection("movies", "DELETE", id);

export const getGenres = () => getCollection("genres");

export const getGenreById = async (id) => {
  const result = await request(`/genres/${id}`);
  if (result !== null) return result;
  return localStore.get("genres").find((genre) => String(genre.id) === String(id)) || null;
};

export const addGenre = (genre) => mutateCollection("genres", "POST", null, genre);

export const updateGenre = (id, genre) => mutateCollection("genres", "PUT", id, genre);

export const deleteGenre = async (id) => mutateCollection("genres", "DELETE", id);

export const getReviews = async (movieId) => {
  const result = await request("/reviews");
  if (result !== null) {
    localStore.set("reviews", result);
    return movieId
      ? result.filter((review) => String(review.movieId) === String(movieId))
      : result;
  }

  const reviews = localStore.get("reviews");
  return movieId
    ? reviews.filter((review) => String(review.movieId) === String(movieId))
    : reviews;
};

export const getSeriesReviews = async (seriesId) => {
  const result = await request("/reviews");
  if (result !== null) {
    localStore.set("reviews", result);
    return result.filter((review) => String(review.seriesId) === String(seriesId));
  }

  return localStore.get("reviews").filter((review) => String(review.seriesId) === String(seriesId));
};

export const getReviewById = async (id) => {
  const result = await request(`/reviews/${id}`);
  if (result !== null) return result;
  return localStore.get("reviews").find((review) => String(review.id) === String(id)) || null;
};

export const addReview = (review) => mutateCollection("reviews", "POST", null, review);

export const updateReview = (id, review) => mutateCollection("reviews", "PUT", id, review);

export const deleteReview = (id) => mutateCollection("reviews", "DELETE", id);