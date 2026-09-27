# MovieHub

MovieHub is a React movie and entertainment management portal. It uses Vite for the frontend and JSON Server as a REST API backend for movies, genres, series, and reviews.

## Features

- Dashboard with total movies, average rating, highest-rated titles, and genre counts
- Movie and TV series catalogues
- Search by title
- Movie filtering by genre, release year, rating, and duration
- Sorting by rating, release year, and title
- Movie and series detail pages
- Administrator movie, series, and genre management
- User registration and sign-in
- Profile management
- Submit ratings and written reviews
- Review persistence in `db.json`
- Review editing and deletion by the original reviewer
- Review-based overall ratings for movies and series
- Welcome alerts after registration and sign-in
- Loading, error, empty, and offline states
- Responsive interface

## Technology

- React 19
- React Router
- Vite
- JSON Server
- JavaScript ES6+
- CSS
- LocalStorage fallback when JSON Server is unavailable

## Requirements

- Node.js 18 or later
- npm

## Installation

From the `movie` directory, install dependencies:

```bash
npm install
```

## Run the application

Start JSON Server in one terminal:

```bash
npm run server
```

The API runs at:

```text
http://localhost:3000
```

Start the Vite development server in a second terminal:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run server` | Start JSON Server on port 3000 |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |

## API endpoints

The application communicates with `http://localhost:3000` through `src/services/api.js`.

### Movies

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/movies` | Retrieve all movies |
| GET | `/movies/:id` | Retrieve one movie |
| POST | `/movies` | Create a movie |
| PUT | `/movies/:id` | Update a movie |
| DELETE | `/movies/:id` | Delete a movie |

### Series

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/series` | Retrieve all series |
| GET | `/series/:id` | Retrieve one series |
| POST | `/series` | Create a series |
| PUT | `/series/:id` | Update a series |
| DELETE | `/series/:id` | Delete a series |

### Genres

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/genres` | Retrieve all genres |
| GET | `/genres/:id` | Retrieve one genre |
| POST | `/genres` | Create a genre |
| PUT | `/genres/:id` | Update a genre |
| DELETE | `/genres/:id` | Delete a genre |

### Reviews

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/reviews` | Retrieve persisted reviews |
| GET | `/reviews/:id` | Retrieve one review |
| POST | `/reviews` | Create a review |
| PUT | `/reviews/:id` | Update a review |
| DELETE | `/reviews/:id` | Delete a review |

Reviews include the related movie or series ID, reviewer name, reviewer identity, rating, comment, and date.

## Rating calculation

User ratings are submitted on a 1-to-5 scale. When reviews exist, the displayed overall rating is calculated as:

```text
Average user review rating x 2 = overall rating out of 10
```

This calculated value is used on detail pages, catalogue cards, sorting, filtering, dashboard rankings, and dashboard averages. If a title has no reviews, its original catalog rating is used.

## Authentication and permissions

- Users can register, sign in, review movies and series, and manage their own reviews.
- Administrators can add, edit, and delete movies and series and manage genres.
- Review edit and delete controls are shown only for the user who created the review.
- Authentication state and registered accounts are stored in LocalStorage for this development project.

## Data storage

The initial JSON Server data is stored in:

```text
db.json
```

When JSON Server is unavailable, the API service uses LocalStorage fallback data so the frontend remains usable during development.

## Application flow

```text
React page or component
	|
	v
useState / useEffect / event handler
	|
	v
src/services/api.js
	|
	v
JSON Server at http://localhost:3000
	|
	v
db.json
	|
	v
React state update and UI re-render
```

## Project structure

```text
movie/
|-- db.json
|-- index.html
|-- package.json
|-- src/
|   |-- components/
|   |   |-- Loading.jsx
|   |   |-- MovieCard.jsx
|   |   |-- MovieForm.jsx
|   |   |-- ReviewForm.jsx
|   |   |-- ReviewList.jsx
|   |   `-- StatusBanner.jsx
|   |-- context/
|   |   `-- AuthContext.jsx
|   |-- hooks/
|   |   `-- useMovies.js
|   |-- pages/
|   |   |-- Dashboard.jsx
|   |   |-- GenreManager.jsx
|   |   |-- Login.jsx
|   |   |-- MovieDetails.jsx
|   |   |-- Movies.jsx
|   |   |-- Profile.jsx
|   |   |-- Register.jsx
|   |   |-- Series.jsx
|   |   |-- SeriesDetails.jsx
|   |   `-- SeriesForm.jsx
|   |-- services/
|   |   `-- api.js
|   |-- styles/
|   |   `-- index.css
|   |-- App.jsx
|   `-- main.jsx
```
