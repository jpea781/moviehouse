import React, { useEffect, useState, useCallback } from "react";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const IMG = "https://image.tmdb.org/t/p/original";

function App() {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [category, setCategory] = useState("trending");
  const [type, setType] = useState("movie");
  const [search, setSearch] = useState("");
  const [watchUrl, setWatchUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= FETCH =================
  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/${type}/week?api_key=${API_KEY}`
      );
      const data = await res.json();
      setMovies(data.results || []);
      setFeatured(data.results?.[0] || null);
    } catch (err) {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [type]);

  const fetchByCategory = useCallback(
    async (cat) => {
      try {
        setLoading(true);
        setError(null);
        let endpoint =
          type === "movie"
            ? `https://api.themoviedb.org/3/movie/${cat}?api_key=${API_KEY}`
            : cat === "upcoming"
            ? `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}`
            : `https://api.themoviedb.org/3/tv/${cat}?api_key=${API_KEY}`;

        const res = await fetch(endpoint);
        const data = await res.json();
        setMovies(data.results || []);
        setFeatured(data.results?.[0] || null);
      } catch {
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    category === "trending" ? fetchTrending() : fetchByCategory(category);
  }, [category, fetchTrending, fetchByCategory]);

  const startWatching = (item) => {
    if (!item?.id) return;
    setWatchUrl(
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${item.id}`
        : `https://vidsrc.to/embed/tv/${item.id}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const heroImage =
    featured?.backdrop_path || featured?.poster_path
      ? `${IMG}${featured.backdrop_path || featured.poster_path}`
      : "";

  // ================= UI =================
  return (
    <div className="bg-black text-white min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 px-6 py-4 flex justify-between items-center">
        <h1
          onClick={() => {
            setCategory("trending");
            setWatchUrl(null);
          }}
          className="text-3xl font-bold cursor-pointer"
        >
          Movie<span className="text-red-600">House</span>
        </h1>

        <input
          className="bg-gray-800 px-4 py-2 rounded-full w-60"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </nav>

      {/* TOP CONTROLS */}
      {!watchUrl && (
        <div className="pt-24 px-6 flex flex-wrap gap-4 items-center">
          {["trending", "popular", "top_rated", "upcoming"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold ${
                category === cat ? "bg-red-600" : "bg-gray-800"
              }`}
            >
              {cat.replace("_", " ").toUpperCase()}
            </button>
          ))}

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setType("movie")}
              className={`px-4 py-2 rounded-full ${
                type === "movie" ? "bg-red-600" : "bg-gray-800"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setType("tv")}
              className={`px-4 py-2 rounded-full ${
                type === "tv" ? "bg-red-600" : "bg-gray-800"
              }`}
            >
              TV Shows
            </button>
          </div>
        </div>
      )}

      {/* PLAYER */}
      {watchUrl && (
        <div className="pt-24 px-6">
          <button
            onClick={() => setWatchUrl(null)}
            className="mb-4 text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <div className="aspect-video bg-black">
            <iframe
              src={watchUrl}
              title="Player"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* HERO */}
      {!watchUrl && featured && (
        <div
          className="relative h-[70vh] bg-cover bg-center mt-6"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute bottom-10 left-10 max-w-xl">
            <h1 className="text-5xl font-bold mb-4">
              {featured.title || featured.name}
            </h1>
            <p className="text-gray-300 mb-6 line-clamp-3">
              {featured.overview}
            </p>
            <button
              onClick={() => startWatching(featured)}
              className="bg-red-600 px-6 py-3 rounded font-semibold hover:bg-red-700 flex items-center gap-2"
            >
              <span>▶</span> Play Now
            </button>
          </div>
        </div>
      )}

      {/* GRID WITH PLAY BUTTONS */}
      {!watchUrl && (
        <div className="px-6 py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="cursor-pointer group relative"
              onClick={() => startWatching(movie)}
            >
              {/* PLAY BUTTON OVERLAY */}
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <span className="text-xl ml-1">▶</span>
                </div>
              </div>
              
              {/* DARK OVERLAY */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              
              {/* MOVIE POSTER */}
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={
                    movie.poster_path
                      ? `${IMG}${movie.poster_path}`
                      : "https://via.placeholder.com/300x450/111/666?text=No+Poster"
                  }
                  alt={movie.title || movie.name}
                  className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <p className="mt-2 text-sm font-semibold truncate group-hover:text-red-400 transition-colors">
                {movie.title || movie.name}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* LOADING/ERROR STATES */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-400">Loading movies...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="text-center py-20 text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchTrending}
            className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* DISCLAIMER FOOTER */}
      <div className="border-t border-gray-800 py-6 text-center">
        <p className="text-gray-500 text-sm px-6 max-w-3xl mx-auto">
          ⚠️ <strong>Disclaimer:</strong>All movie data is provided by third-party APIs. No copyright infringement is intended. 
          Please support the official release of movies and TV shows through authorized platforms.
        </p>
      </div>
    </div>
  );
}

export default App;