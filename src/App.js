import React, { useEffect, useState } from "react";

const API_KEY = "df2c6f6ab8a62fe151bacce928f4cba0";
const IMG = "https://image.tmdb.org/t/p/original";

function App() {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [category, setCategory] = useState("trending");
  const [type, setType] = useState("movie");
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [watchUrl, setWatchUrl] = useState(null);

  // ================= FETCH FUNCTIONS =================

  const fetchTrending = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/${type}/week?api_key=${API_KEY}`
      );
      const data = await res.json();
      setMovies(data.results || []);
      setFeatured(data.results?.[0] || null);
    } catch (err) {
      console.error("Trending fetch failed:", err);
    }
  };

  const fetchByCategory = async (cat) => {
    try {
      let endpoint = "";

      if (type === "movie") {
        endpoint = `https://api.themoviedb.org/3/movie/${cat}?api_key=${API_KEY}`;
      } else {
        endpoint =
          cat === "upcoming"
            ? `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}`
            : `https://api.themoviedb.org/3/tv/${cat}?api_key=${API_KEY}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      setMovies(data.results || []);
      setFeatured(data.results?.[0] || null);
    } catch (err) {
      console.error("Category fetch failed:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/${type}?api_key=${API_KEY}&query=${search}`
      );
      const data = await res.json();
      setMovies(data.results || []);
      setFeatured(data.results?.[0] || null);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const fetchTrailer = async (item) => {
    if (!item) return;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${item.id}/videos?api_key=${API_KEY}`
      );
      const data = await res.json();
      const trailer = data.results?.find(
        (vid) => vid.type === "Trailer" && vid.site === "YouTube"
      );
      setTrailerKey(trailer?.key || null);
    } catch (err) {
      console.error("Trailer fetch failed:", err);
    }
  };

  // ================= ACTIONS =================

  const startWatching = (item) => {
    if (!item) return;

    const url =
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${item.id}`
        : `https://vidsrc.to/embed/tv/${item.id}`;

    setWatchUrl(url);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ================= EFFECTS =================

  useEffect(() => {
    if (category === "trending") {
      fetchTrending();
    } else {
      fetchByCategory(category);
    }
  }, [category, type]);

  useEffect(() => {
    fetchTrailer(featured);
  }, [featured]);

  // ================= UI =================

  return (
    <div className="bg-black text-white min-h-screen">

      {/* NAVBAR */}
      <div className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <h1
          onClick={() => {
            setSearch("");
            setCategory("trending");
            setWatchUrl(null);
            fetchTrending();
          }}
          className="text-3xl md:text-4xl font-extrabold tracking-wider cursor-pointer"
        >
          <span className="text-white">Movie</span>
          <span className="text-red-600">House</span>
        </h1>

        <div className="hidden md:flex gap-10 text-lg font-semibold">
          <button onClick={() => { setCategory("trending"); setWatchUrl(null); fetchTrending(); }} className="hover:text-red-500">Home</button>
          <button onClick={() => { setCategory("popular"); setWatchUrl(null); fetchByCategory("popular"); }} className="hover:text-red-500">Popular</button>
          <button onClick={() => { setCategory("top_rated"); setWatchUrl(null); fetchByCategory("top_rated"); }} className="hover:text-red-500">Top Rated</button>
          <button onClick={() => { setCategory("upcoming"); setWatchUrl(null); fetchByCategory("upcoming"); }} className="hover:text-red-500">Upcoming</button>
          <button
            onClick={() => {
              setType(type === "movie" ? "tv" : "movie");
              setCategory("trending");
              setWatchUrl(null);
            }}
            className="hover:text-red-500"
          >
            {type === "movie" ? "TV Shows" : "Movies"}
          </button>
        </div>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-900 px-4 py-2 rounded-full outline-none text-sm text-white focus:ring-2 focus:ring-red-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* WATCH PLAYER */}
      {watchUrl && (
        <div className="pt-20 px-4">
          <div className="w-full aspect-video bg-black">
            <iframe
              src={watchUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title="Watch"
            ></iframe>
          </div>
        </div>
      )}

      {/* HERO */}
      {!watchUrl && featured && (
        <div className="relative h-[85vh] pt-20 flex items-end px-10 pb-20">

          {trailerKey ? (
            <iframe
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              src={`https://www.youtube.com/embed/${trailerKey}?mute=1&controls=0&loop=1&playlist=${trailerKey}`}
              title="Trailer"
              frameBorder="0"
              allow="fullscreen"
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage: featured.backdrop_path
                  ? `url(${IMG}${featured.backdrop_path})`
                  : "none"
              }}
            />
          )}

          <div className="relative z-10 max-w-xl">
            <h2 className="text-5xl font-bold mb-4">
              {featured.title || featured.name}
            </h2>
            <p className="text-gray-300 mb-6 line-clamp-3">
              {featured.overview}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => startWatching(featured)}
                className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition font-semibold"
              >
                ▶ Play
              </button>
              <button
                onClick={() => setSelectedMovie(featured)}
                className="bg-gray-700 px-6 py-2 rounded hover:bg-gray-600 transition"
              >
                More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      {!watchUrl && (
        <div className="px-8 py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="cursor-pointer transform hover:scale-105 transition duration-300"
            >
              <img
                onClick={() => startWatching(movie)}
                src={
                  movie.poster_path
                    ? `${IMG}${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.title || movie.name}
                className="rounded-lg h-[300px] object-cover w-full"
              />
              <h3 className="mt-2 text-sm font-semibold">
                {movie.title || movie.name}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full p-6 relative">

            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-3 right-4 text-2xl hover:text-red-500"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={
                  selectedMovie.poster_path
                    ? `${IMG}${selectedMovie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={selectedMovie.title || selectedMovie.name}
                className="w-full md:w-1/3 rounded"
              />

              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedMovie.title || selectedMovie.name}
                </h2>
                <p className="text-gray-400 mb-2">
                  Release: {selectedMovie.release_date || selectedMovie.first_air_date}
                </p>
                <p className="mb-4">{selectedMovie.overview}</p>

                <button
                  onClick={() => startWatching(selectedMovie)}
                  className="mt-4 bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition font-semibold"
                >
                  ▶ Start Watching
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
