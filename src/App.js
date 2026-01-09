import React, { useEffect, useState, useCallback, useMemo } from "react";

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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // ================= ADD POPADS CODE HERE =================
  useEffect(() => {
    // Wait 3 seconds then load PopAds
    const timer = setTimeout(() => {
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.setAttribute('data-cfasync', 'false');
        
        // Your exact PopAds code
        script.textContent = `/*<![CDATA[/* */(function(){var a=window,u="aa4b8d72cacf4f7b7be1c85d1ed32b78",o=[["siteId",989-10+639-268*292+5344481],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],s=["d3d3LmRpc3BsYXl2ZXJ0aXNpbmcuY29tL2RUR2Fqdy9qc291bmRtYW5hZ2VyMi1ub2RlYnVnLWpzbWluLmpz","ZDNtem9rdHk5NTFjNXcuY2xvdWRmcm9udC5uZXQvcFMvVGJtWlkvamFuZ3VsYXItYXV0aDAubWluLmNzcw=="],x=-1,k,f,c=function(){clearTimeout(f);x++;if(s[x]&&!(1793892210000<(new Date).getTime()&&1<x)){k=a.document.createElement("script");k.type="text/javascript";k.async=!0;var j=a.document.getElementsByTagName("script")[0];k.src="https://"+atob(s[x]);k.crossOrigin="anonymous";k.onerror=c;k.onload=function(){clearTimeout(f);a[u.slice(0,16)+u.slice(0,16)]||c()};f=setTimeout(c,5E3);j.parentNode.insertBefore(k,j)}};if(!a[u]){try{Object.freeze(a[u]=o)}catch(e){}c()}})();/*]]>/* */`;
        
        document.head.appendChild(script);
        console.log('PopAds loaded');
      } catch (e) {
        console.log('PopAds error:', e);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  // ================= END OF POPADS CODE =================

  const categoryLabels = useMemo(() => ({
    trending: "Trending",
    popular: "Popular",
    top_rated: "Top Rated",
    upcoming: type === "movie" ? "Upcoming" : "Airing Today"
  }), [type]);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/${type}/week?api_key=${API_KEY}`
      );
      
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setMovies(data.results || []);
      setFeatured(data.results?.[0] || null);
    } catch (err) {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [type]);

  const fetchByCategory = useCallback(async (cat) => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = "";
      
      if (type === "movie") {
        endpoint = `https://api.themoviedb.org/3/movie/${cat}?api_key=${API_KEY}`;
      } else {
        endpoint = cat === "upcoming" 
          ? `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}`
          : `https://api.themoviedb.org/3/tv/${cat}?api_key=${API_KEY}`;
      }

      const res = await fetch(endpoint);
      
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setMovies(data.results || []);
      setFeatured(data.results?.[0] || null);
    } catch (err) {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [type]);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearch("");
      category === "trending" ? fetchTrending() : fetchByCategory(category);
      return;
    }

    try {
      setIsSearching(true);
      setLoading(true);
      setError(null);
      
      const endpoint = `https://api.themoviedb.org/3/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
      
      const res = await fetch(endpoint);
      
      if (!res.ok) throw new Error("Search failed");
      
      const data = await res.json();
      setSearchResults(data.results || []);
      setFeatured(null);
      setMovies([]);
      
    } catch (err) {
      setError("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  }, [type, category, fetchTrending, fetchByCategory]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      category === "trending" ? fetchTrending() : fetchByCategory(category);
      return;
    }
    
    if (value.trim().length >= 2) {
      setIsSearching(true);
    }
    
    const timeout = setTimeout(() => {
      if (value.trim().length >= 2) {
        performSearch(value);
      }
    }, 500);
    
    setTypingTimeout(timeout);
  };

  useEffect(() => {
    if (!search) {
      category === "trending" ? fetchTrending() : fetchByCategory(category);
    }
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [category, type, search, typingTimeout, fetchTrending, fetchByCategory]);

  const handleClearSearch = () => {
    setSearch("");
    setSearchResults([]);
    setIsSearching(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    category === "trending" ? fetchTrending() : fetchByCategory(category);
  };

  const startWatching = (item) => {
    if (!item?.id) return;
    const url = type === "movie"
      ? `https://vidsrc.to/embed/movie/${item.id}`
      : `https://vidsrc.to/embed/tv/${item.id}`;
    setWatchUrl(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetToHome = () => {
    setSearch("");
    setSearchResults([]);
    setIsSearching(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setCategory("trending");
    setWatchUrl(null);
    fetchTrending();
  };

  const displayMovies = search.trim() ? searchResults : movies;
  const heroImage = featured?.backdrop_path || featured?.poster_path
    ? `${IMG}${featured.backdrop_path || featured.poster_path}`
    : "";

  return (
    <div className="bg-black text-white min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-900">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h1
            onClick={resetToHome}
            className="text-2xl md:text-3xl font-bold cursor-pointer hover:text-red-500 whitespace-nowrap"
          >
            🎬 Movie<span className="text-red-600">House</span>
          </h1>
          
          <div className="relative flex-1 md:flex-none md:w-64 lg:w-80 flex items-center">
            <div className="relative w-full">
              <input
                className="bg-gray-900/80 px-4 py-2 rounded-full w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 pr-10"
                placeholder="Search movies or TV shows..."
                value={search}
                onChange={handleSearchChange}
                type="text"
              />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {search ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="text-gray-400">🔍</span>
                )}
              </div>
              
              {isSearching && search.trim().length >= 2 && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setType("movie");
              setSearch("");
              setSearchResults([]);
            }}
            className={`px-4 py-2 rounded-full text-sm ${type === "movie" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              setType("tv");
              setSearch("");
              setSearchResults([]);
            }}
            className={`px-4 py-2 rounded-full text-sm ${type === "tv" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            TV Shows
          </button>
        </div>
      </nav>

      <div className="pt-24 md:pt-28">
        {search.trim() && (
          <div className="px-4 md:px-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold">
                {isSearching ? (
                  <span className="text-gray-400">Searching for "{search}"...</span>
                ) : (
                  <>
                    Search Results for "{search}"
                    {searchResults.length > 0 && (
                      <span className="text-gray-400 text-base ml-2">
                        ({searchResults.length} results)
                      </span>
                    )}
                  </>
                )}
              </h2>
              {search && !isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {!watchUrl && !search.trim() && (
          <div className="px-4 md:px-6 mb-6 md:mb-8">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {Object.keys(categoryLabels).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm ${category === cat ? "bg-red-600" : "bg-gray-900 hover:bg-gray-800"}`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>
        )}

        {watchUrl ? (
          <div className="px-4 md:px-6">
            <button
              onClick={() => setWatchUrl(null)}
              className="mb-4 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800"
            >
              ← Back
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                src={watchUrl}
                title="Player"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          <>
            {featured && !search.trim() && (
              <div 
                className="relative h-[50vh] md:h-[70vh] bg-cover bg-center mb-8 md:mb-12"
                style={{ 
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${heroImage})` 
                }}
              >
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
                      {featured.title || featured.name}
                    </h1>
                    <p className="text-gray-300 mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 text-sm md:text-base">
                      {featured.overview}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => startWatching(featured)}
                        className="bg-red-600 hover:bg-red-700 px-5 md:px-6 py-2 md:py-3 rounded-lg font-semibold"
                      >
                        ▶ Play Now
                      </button>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span className="bg-gray-900/80 px-3 py-1 rounded-full">
                          ⭐ {featured.vote_average?.toFixed(1)}
                        </span>
                        <span>
                          {featured.release_date?.substring(0,4) || featured.first_air_date?.substring(0,4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && displayMovies.length > 0 && (
              <div className="px-4 md:px-6">
                {!search.trim() && (
                  <h2 className="text-xl md:text-2xl font-bold mb-6">
                    {categoryLabels[category]} {type === "movie" ? "Movies" : "TV Shows"}
                  </h2>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {displayMovies.map((item) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer"
                      onClick={() => startWatching(item)}
                    >
                      <div className="relative overflow-hidden rounded-xl aspect-[2/3] mb-2">
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-lg md:text-xl ml-1">▶</span>
                          </div>
                        </div>
                        
                        <img
                          src={
                            item.poster_path
                              ? `${IMG}${item.poster_path}`
                              : "https://via.placeholder.com/300x450/111/666?text=No+Poster"
                          }
                          alt={item.title || item.name}
                          className="w-full h-full object-cover group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-full text-xs font-bold">
                          ⭐ {item.vote_average?.toFixed(1) || "N/A"}
                        </div>
                      </div>
                      
                      <p className="font-medium text-sm md:text-base truncate group-hover:text-red-400">
                        {item.title || item.name}
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        {item.release_date?.substring(0,4) || item.first_air_date?.substring(0,4) || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && search.trim() && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-20">
                <div className="text-gray-500 text-6xl mb-4">🔍</div>
                <p className="text-xl font-medium mb-2">No results found for "{search}"</p>
                <button
                  onClick={handleClearSearch}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-400">
              {search.trim() ? "Searching..." : `Loading ${type === "movie" ? "movies" : "TV shows"}...`}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-xl font-medium mb-2">{error}</p>
            <button
              onClick={fetchTrending}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* SIMPLE DISCLAIMER */}
      <footer className="mt-12 border-t border-gray-900 py-8">
        <div className="px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-yellow-600/20 rounded-full mb-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">LEGAL DISCLAIMER</h3>
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <div className="space-y-4">
              <p className="text-gray-300">
                <strong>MovieHouse is a content indexing platform only.</strong> We do not host, upload, cache, or distribute any copyrighted material.
              </p>
              
              <p className="text-gray-300">
                All media links are automatically gathered from third-party websites that are not under our control. MovieHouse is not responsible for the content, legality, or copyright compliance of any external sources.
              </p>
              
              <p className="text-gray-300">
                Under no circumstances shall MovieHouse be held liable for any copyright infringement claims. All copyright issues must be addressed to the original content hosts.
              </p>
              
              <p className="text-gray-300">
                Use of this website is at your own risk. By accessing this site, you agree that MovieHouse bears no responsibility for external content.
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-400 text-sm text-center">
                Movie information provided by The Movie Database (TMDB)
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;