document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const movieTitle = document.getElementById("movie-title");
    const imdbRating = document.getElementById("imdb-rating");
    const movieDescription = document.querySelector(".description");

    async function searchMovies(query) {
        if (query.length < 2) return;
        
        let response = await fetch("http://127.0.0.1:5000/search?query=" + encodeURIComponent(query));
        let movies = await response.json();
        
        resultsContainer.innerHTML = "";
        movies.forEach(movie => {
            let div = document.createElement("div");
            div.classList.add("result-item");
            div.textContent = movie.title;
            div.onclick = () => getRecommendations(movie.index, movie.title);
            resultsContainer.appendChild(div);
        });
    }

    async function getRecommendations(movieId, title) {
        let response = await fetch(`http://127.0.0.1:5000/recommend?movie_id=${movieId}&top_n=5`);
        let data = await response.json();
        
        if (data.recommended_movies) {
            let recommended = data.recommended_movies;
            if (recommended.length > 0) {
                movieTitle.textContent = recommended[0].title;
                imdbRating.textContent = recommended[0].imdb_rating;
                movieDescription.textContent = recommended[0].summary;
            }
        }
    }

    searchInput.addEventListener("input", function () {
        searchMovies(this.value);
    });
});
