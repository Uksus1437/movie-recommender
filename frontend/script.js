document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const movieTitle = document.getElementById("movie-title");
    const imdbRating = document.getElementById("imdb-rating");
    const movieDescription = document.querySelector(".description");

    async function searchMovies(query) {
        if (query.trim().length < 2) {
            resultsContainer.style.display = "none";
            return;
        }

        try {
            let response = await fetch("http://127.0.0.1:5000/search?query=" + encodeURIComponent(query));
            let movies = await response.json();

            resultsContainer.innerHTML = "";
            if (movies.length === 0) {
                resultsContainer.innerHTML = "<div class='result-item'>Ничего не найдено</div>";
            }

            movies.forEach(movie => {
                let div = document.createElement("div");
                div.classList.add("result-item");
                div.textContent = movie.title;
                div.onclick = () => getRecommendations(movie.index, movie.title);
                resultsContainer.appendChild(div);
            });

            resultsContainer.style.display = "block"; 

        } catch (error) {
            console.error("Ошибка поиска:", error);
            resultsContainer.innerHTML = "<div class='result-item'>Ошибка загрузки</div>";
            resultsContainer.style.display = "block";
        }
    }

    async function getRecommendations(movieId, title) {
        try {
            let response = await fetch(`http://127.0.0.1:5000/recommend?movie_id=${movieId}&top_n=10`);
            let data = await response.json();

            if (data.recommended_movies && data.recommended_movies.length > 0) {
                let recommended = data.recommended_movies[0];
                movieTitle.textContent = recommended.title;
                if (recommended.imdb_rating == 0){
                    imdbRating.textContent = '-';}
                else{
                    imdbRating.textContent = recommended.imdb_rating
                }
                movieDescription.textContent = recommended.summary || "Описание отсутствует";
            }
        } catch (error) {
            console.error("Ошибка получения рекомендаций:", error);
        }

        resultsContainer.style.display = "none";
    }

    searchInput.addEventListener("input", function () {
        searchMovies(this.value);
    });

    document.addEventListener("click", function (event) {
        if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = "none";
        }
    });
});
