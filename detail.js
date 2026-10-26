async function getMoviesDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    document.querySelector("#movieTitle").textContent = "Movie ID not found";
    return;
  }

  const url = `https://movies-api.accel.li/api/v2/movie_details.json?movie_id=${id}&with_images=true&with_cast=true`;

  try {
    const fetchApi = await fetch(url);
    const response = await fetchApi.json();

    console.log(response);

    const movie = response.data.movie;

    document.querySelector("#movieCast").textContent =
    (movie.cast || []).map(actor => actor.name).join(", ") || "Cast not available";

    const trailer = document.querySelector("#movieTrailer");

    trailer.innerHTML = movie.yt_trailer_code
      ? `<iframe src="https://www.youtube.com/embed/${movie.yt_trailer_code}" class="w-96 h-56" allowfullscreen></iframe>`
      : "Trailer not available.";

    document.querySelector("#movieScreenshots").innerHTML = `
    <img src="${movie.medium_screenshot_image1 || ""}"
         alt="Movie poster"
         class="w-96 h-56 object-cover">

    <img src="${movie.medium_screenshot_image2 || ""}"
         alt="Movie poster"
         class="w-96 h-56 object-cover">


  
`;

    document.querySelector("#movieTitle").textContent =
      movie.title || "Unknown title";

    document.querySelector("#movieTitle").textContent =
      movie.title || "Unknown title";

    document.querySelector("#movieYear").textContent =
      movie.year || "Year unavailable";

    document.querySelector("#movieGenres").textContent = (
      movie.genres || []
    ).join(" / ");

    document.querySelector("#moviePoster").innerHTML = `
            <img src="${movie.medium_cover_image || ""}"
                 alt="${movie.title || "Movie poster"}"
                 class="w-full h-full object-cover">
        `;

    document.querySelector("#movieLikes").textContent =
      "❤️ " + (movie.like_count ?? 0);

    document.querySelector("#movieRating").textContent =
      "⭐ " + (movie.rating ?? "N/A") + " / 10";

    document.querySelector("#movieImdb").textContent = movie.rating
      ? movie.rating + " / 10"
      : "Not available";

    document.querySelector("#movieDescription").textContent =
      movie.description_full ||
      movie.description_intro ||
      "No description available.";
  } catch (error) {
    console.log("Error fetching movie details:", error);

    document.querySelector("#movieTitle").textContent =
      "Unable to load movie details";
  }
}

getMoviesDetail();

async function getMoviesSuggection() {
  const id = new URLSearchParams(location.search).get("id");

  try {
    const res = await fetch(
      `https://movies-api.accel.li/api/v2/movie_suggestions.json?movie_id=${id}`,
    );
    const data = await res.json();
    const movies = data.data.movies || [];

    document.querySelector("#Poster").innerHTML = movies
      .slice(0, 4)
      .map(
        (movie) => `
            <a href="detail.html?id=${movie.id}" class="border-2 border-white  hover:border-green-500 w-32 h-48 rounded overflow-hidden">
                <img src="${movie.medium_cover_image}" class="w-32 h-48 object-cover">
                <p class="text-white text-sm p-2">${movie.title}</p>
            </a>
        `,
      )
      .join("");
  } catch (error) {
    console.log(error);
  }
}

getMoviesSuggection();
