import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MovieFormComponent from "../components/MovieForm";
import { addMovie, getGenres, getMovieById, updateMovie } from "../services/api";
import Loading from "../components/Loading";

function MovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    const load = async () => {
      const genreData = await getGenres();
      setGenres(genreData || []);

      if (id) {
        setMovie(await getMovieById(id));
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const handleSubmit = async (data) => {
    if (id) {
      await updateMovie(id, data);
      navigate(`/movies/${id}`);
    } else {
      const created = await addMovie(data);
      navigate(`/movies/${created.id}`);
    }
  };

  if (loading) return <Loading />;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{id ? "Management" : "New Entry"}</p>
          <h1>{id ? "Edit Movie" : "Add Movie"}</h1>
          <p className="muted">{id ? "Update the movie information." : "Add a new title to your catalog."}</p>
        </div>
      </div>
      <MovieFormComponent movie={movie} genres={genres} onSubmit={handleSubmit} />
    </section>
  );
}

export default MovieForm;