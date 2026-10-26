const movieContainer = document.querySelector(".fetchdata");
const genreSelect = document.querySelector("#genre");
const ratingSelect = document.querySelector("#rating");
const yearSelect = document.querySelector("#year");
const languageSelect = document.querySelector("#language");
const qualitySelect = document.querySelector("#quality");
const orderBySelect = document.querySelector("#orderBy");
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const lastPageBtn = document.querySelector("#lastPageBtn");

const API_URL = "https://movies-api.accel.li/api/v2/list_movies.json";

let allMovies = [];
let currentPage = 1;
let moviesPerPage = 20;
let totalMovies = 0;
let totalPages = 1;

async function fetchMovies() {
  movieContainer.innerHTML = '<p class="flex justify-center items-center text-center mx-auto text-white bg-blue-500 w-32 h-12 rounded-md">Loading movies...</p>';

  try {
    const searchText = searchInput.value.trim();

    let url = API_URL + "?limit=" + moviesPerPage + "&page=" + currentPage;

    if (searchText !== "") {
      url += "&query_term=" + encodeURIComponent(searchText);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("API error: " + response.status);
    }

    const data = await response.json();

    allMovies = data.data?.movies || [];
    totalMovies = Number(data.data?.movie_count) || 0;

    totalPages = Math.max(1, Math.ceil(totalMovies / moviesPerPage));

    if (currentPage > totalPages) {
      currentPage = totalPages;
      fetchMovies();
      return;
    }

    showPageButtons();

    if (lastPageBtn) {
      lastPageBtn.textContent = "Last (" + totalPages + ")";
    }

    applyFilters();
  } catch (error) {
    console.log("Error fetching movies:", error);

    movieContainer.innerHTML =
      '<p class="text-red-400">Movies load nahi ho sakin.</p>';
  }
}

function showPageButtons() {
  const pageButtons = document.querySelector("#pageButtons");

  if (!pageButtons) {
    return;
  }

  pageButtons.innerHTML = "";

  let startPage = Math.max(1, currentPage - 4);
  let endPage = Math.min(totalPages, startPage + 9);

  if (endPage - startPage < 9) {
    startPage = Math.max(1, endPage - 9);
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");

    button.textContent = i;
    button.className = "font-semibold text-lg w-12 h-10 rounded-lg mt-20";

    if (i === currentPage) {
      button.classList.add("text-white", "bg-green-500");
    } else {
      button.classList.add(
        "text-green-500",
        "bg-white",
        "hover:bg-green-400",
        "hover:text-white",
      );
    }

    button.onclick = function () {
      goToPage(i);
    };

    pageButtons.appendChild(button);
  }
}

function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedGenre = genreSelect.value.toLowerCase();
  const selectedRating = ratingSelect.value;
  const selectedYear = yearSelect.value;
  const selectedLanguage = languageSelect.value.toLowerCase();
  const selectedQuality = qualitySelect.value.toLowerCase();
  const selectedOrder = orderBySelect.value;

  const filteredMovies = allMovies.filter(function (movie) {
    const title = String(movie.title || "").toLowerCase();
    const searchMatch = title.includes(searchText);

    const genres = Array.isArray(movie.genres) ? movie.genres : [];

    const genreMatch =
      selectedGenre === "" ||
      genres.some(function (genre) {
        return genre.toLowerCase() === selectedGenre;
      });

    const rating = Number(movie.rating) || 0;
    const ratingMatch =
      selectedRating === "" || rating >= Number(selectedRating);

    const year = Number(movie.year) || 0;
    let yearMatch = true;

    if (selectedYear === "2026" || selectedYear === "2025") {
      yearMatch = year === Number(selectedYear);
    } else if (selectedYear === "2020-now") {
      yearMatch = year >= 2020;
    } else if (selectedYear === "2010-now") {
      yearMatch = year >= 2010;
    } else if (selectedYear === "2010-2019") {
      yearMatch = year >= 2010 && year <= 2019;
    } else if (selectedYear === "2000-2009") {
      yearMatch = year >= 2000 && year <= 2009;
    } else if (selectedYear === "1990-1999") {
      yearMatch = year >= 1990 && year <= 1999;
    } else if (selectedYear === "1980-1989") {
      yearMatch = year >= 1980 && year <= 1989;
    } else if (selectedYear === "1970-1979") {
      yearMatch = year >= 1970 && year <= 1979;
    } else if (selectedYear === "1950-1969") {
      yearMatch = year >= 1950 && year <= 1969;
    } else if (selectedYear === "1900-1949") {
      yearMatch = year >= 1900 && year <= 1949;
    }

    const language = String(movie.language || "").toLowerCase();
    const languageMatch =
      selectedLanguage === "" || language === selectedLanguage;

    const torrents = Array.isArray(movie.torrents) ? movie.torrents : [];

    const qualities = torrents.map(function (torrent) {
      return String(torrent.quality || "").toLowerCase();
    });

    const qualityMatch =
      selectedQuality === "" || qualities.includes(selectedQuality);

    return (
      searchMatch &&
      genreMatch &&
      ratingMatch &&
      yearMatch &&
      languageMatch &&
      qualityMatch
    );
  });
  
  if (selectedOrder === "latest") {
    filteredMovies.sort(function (a, b) {
      return (
        (Number(b.date_uploaded_unix) || 0) -
        (Number(a.date_uploaded_unix) || 0)
      );
    });
  } else if (selectedOrder === "oldest") {
    filteredMovies.sort(function (a, b) {
      return (
        (Number(a.date_uploaded_unix) || 0) -
        (Number(b.date_uploaded_unix) || 0)
      );
    });
  } else if (selectedOrder === "featured" || selectedOrder === "rating") {
    filteredMovies.sort(function (a, b) {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
  } else if (selectedOrder === "year") {
    filteredMovies.sort(function (a, b) {
      return (Number(b.year) || 0) - (Number(a.year) || 0);
    });
  } else if (selectedOrder === "alphabetical") {
    filteredMovies.sort(function (a, b) {
      return (a.title || "").localeCompare(b.title || "");
    });
  } else if (selectedOrder === "seeds") {
    filteredMovies.sort(function (a, b) {
      const seedsA = Math.max(
        0,
        ...(a.torrents || []).map(function (torrent) {
          return Number(torrent.seeds) || 0;
        }),
      );

      const seedsB = Math.max(
        0,
        ...(b.torrents || []).map(function (torrent) {
          return Number(torrent.seeds) || 0;
        }),
      );

      return seedsB - seedsA;
    });
  } else if (selectedOrder === "peers") {
    filteredMovies.sort(function (a, b) {
      const peersA = Math.max(
        0,
        ...(a.torrents || []).map(function (torrent) {
          return Number(torrent.peers) || 0;
        }),
      );

      const peersB = Math.max(
        0,
        ...(b.torrents || []).map(function (torrent) {
          return Number(torrent.peers) || 0;
        }),
      );

      return peersB - peersA;
    });
  } else if (selectedOrder === "likes") {
    filteredMovies.sort(function (a, b) {
      return (Number(b.like_count) || 0) - (Number(a.like_count) || 0);
    });
  } else if (selectedOrder === "rt_audience") {
    filteredMovies.sort(function (a, b) {
      return (
        (Number(b.rt_audience_rating) || 0) -
        (Number(a.rt_audience_rating) || 0)
      );
    });
  } else if (selectedOrder === "downloads") {
    filteredMovies.sort(function (a, b) {
      return (Number(b.download_count) || 0) - (Number(a.download_count) || 0);
    });
  }

  displayMovies(filteredMovies);
}

function displayMovies(movies) {
  movieContainer.innerHTML = "";

  if (movies.length === 0) {
    movieContainer.innerHTML =
      '<p class="col-span-full text-center text-xl mt-10 text-white">' +
      "No movies found. Try another search or filter.</p>";
    return;
  }

  let html = "";

  movies.forEach(function (movie) {
    const torrents = Array.isArray(movie.torrents) ? movie.torrents : [];

    const qualityList = [
      ...new Set(
        torrents
          .map(function (torrent) {
            return String(torrent.quality || "").trim();
          })
          .filter(Boolean),
      ),
    ];

    const genres = Array.isArray(movie.genres) ? movie.genres.join(", ") : "";

    html += `
            <div class="group relative overflow-hidden rounded-lg
                        border-2 border-gray-800 hover:border-green-500
                        transition duration-300">

                <img
                    src="${movie.medium_cover_image || ""}"
                    alt="${movie.title || "Movie poster"}"
                    loading="lazy"
                    class="w-full aspect-[2/3] object-cover
                           transition-transform duration-300
                           group-hover:scale-105">

                <div class="absolute inset-0 flex flex-col
                            items-center justify-center gap-3
                            bg-black/80 p-3 opacity-0
                            transition-opacity duration-300
                            group-hover:opacity-100">

                    <p class="text-yellow-400 text-2xl font-bold">
                        ⭐ ${movie.rating ?? "N/A"}
                    </p>

                    <p class="text-center text-white font-bold text-xl">
                        ${genres}
                    </p>

                    <p class="text-white font-bold text-xl">
                        ${movie.year ?? "Unknown year"}
                    </p>
                    

                    

                    <p class="text-white text-center text-lg mb-5">
                        ${
                          qualityList.length
                            ? qualityList.join(", ")
                            : "Quality unavailable"
                        }
                    </p>

                    <a
                      href="detail.html?id=${movie.id}"
                        
                        class="absolute bottom-4 left-1/2
                        -translate-x-1/2 bg-green-500
                        hover:bg-green-700 text-white
                        rounded-lg font-semibold w-32 h-12
                        flex items-center justify-center
                        transition duration-300">
                        View Details
                    </a>

                </div>
            </div>
        `;
  });

  movieContainer.innerHTML = html;
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies();
  }
}

function firstPage() {
  currentPage = 1;
  fetchMovies();
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies();
  }
}

function lastPage() {
  currentPage = totalPages;
  fetchMovies();
}

function goToPage(pageNumber) {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    currentPage = pageNumber;
    fetchMovies();
  }
}

searchBtn.addEventListener("click", function () {
  currentPage = 1;
  fetchMovies();
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchMovies();
  }
});

genreSelect.addEventListener("change", applyFilters);
ratingSelect.addEventListener("change", applyFilters);
yearSelect.addEventListener("change", applyFilters);
languageSelect.addEventListener("change", applyFilters);
qualitySelect.addEventListener("change", applyFilters);
orderBySelect.addEventListener("change", applyFilters);

fetchMovies();
