import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSeries, getSeriesById, updateSeries } from "../services/api";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function SeriesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", releaseDate: "", rating: "", totalEpisodes: "", totalSeasons: "", avgEpisodeRuntime: "", thumbnail: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSeriesById(id).then((item) => {
      if (item) setForm({
        title: item.title ?? "",
        releaseDate: item.releaseDate ?? "",
        rating: item.rating ?? "",
        totalEpisodes: item.totalEpisodes ?? "",
        totalSeasons: item.totalSeasons ?? "",
        avgEpisodeRuntime: item.avgEpisodeRuntime ?? "",
        thumbnail: item.thumbnail ?? "",
        description: item.description ?? ""
      });
    });
  }, [id]);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const rating = Number(form.rating);
    const totalEpisodes = Number(form.totalEpisodes);
    const totalSeasons = Number(form.totalSeasons);
    const avgEpisodeRuntime = Number(form.avgEpisodeRuntime);

    if (!form.title.trim() || !form.releaseDate || rating < 0 || rating > 10 || totalEpisodes < 1 || totalSeasons < 1 || avgEpisodeRuntime < 1 || !form.thumbnail.trim() || !form.description.trim()) {
      setError("Enter all series details, including a thumbnail, description, and average episode runtime.");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        releaseDate: form.releaseDate,
        rating,
        totalEpisodes,
        totalSeasons,
        avgEpisodeRuntime,
        thumbnail: form.thumbnail.trim(),
        description: form.description.trim()
      };
      if (id) await updateSeries(id, data);
      else await addSeries(data);
      navigate("/series");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Series management</p>
          <h1>{id ? "Edit Series" : "Add Series"}</h1>
          <p className="muted">{id ? "Update the series details." : "Add a TV series to the library."}</p>
        </div>
      </div>

      <form className="form-card series-form" onSubmit={handleSubmit}>
        {error && <div className="error-box">{error}</div>}
        <div className="form-grid">
          <label>Title *<input name="title" value={form.title} onChange={handleChange} placeholder="Series title" /></label>
          <label>Release date *<input name="releaseDate" type="date" value={form.releaseDate} onChange={handleChange} /></label>
          <label>Rating (0-10) *<input name="rating" type="number" min="0" max="10" step="0.1" value={form.rating} onChange={handleChange} /></label>
          <label>Total episodes *<input name="totalEpisodes" type="number" min="1" value={form.totalEpisodes} onChange={handleChange} /></label>
          <label>Total seasons *<input name="totalSeasons" type="number" min="1" value={form.totalSeasons} onChange={handleChange} /></label>
          <label>Avg episode runtime (minutes) *<input name="avgEpisodeRuntime" type="number" min="1" value={form.avgEpisodeRuntime} onChange={handleChange} /></label>
          <label>Thumbnail URL *<input name="thumbnail" type="url" value={form.thumbnail} onChange={handleChange} placeholder="https://..." /></label>
        </div>
        <label>Description *<textarea name="description" rows="5" value={form.description} onChange={handleChange} placeholder="Series description" /></label>
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="button button-primary" disabled={saving}>{saving ? "Saving..." : id ? "Update Series" : "Add Series"}</button>
        </div>
      </form>
    </section>
  );
}

export default SeriesForm;