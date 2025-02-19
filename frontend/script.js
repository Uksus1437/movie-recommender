document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");

    const movieTitle = document.getElementById("movie-title");
    const imdbRating = document.getElementById("imdb-rating");
    const movieDescription = document.querySelector(".description");
    
    // Получаем сам right-panel, чтобы применять класс анимации
    const rightPanel = document.querySelector(".right-panel");

    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    let recommendedMovies = [];
    let currentIndex = 0;

    // Функция обновления состояний кнопок
    function updateButtons() {
        // Если нет фильмов или только один - обе кнопки неактивны
        if (recommendedMovies.length <= 1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        // На первом элементе отключаем prev
        prevBtn.disabled = (currentIndex === 0);
        // На последнем отключаем next
        nextBtn.disabled = (currentIndex === recommendedMovies.length - 1);
    }

    // Функция поиска фильмов
    async function searchMovies(query) {
        if (query.trim().length < 2) {
            resultsContainer.style.display = "none";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/search?query=" + encodeURIComponent(query));
            const movies = await response.json();

            resultsContainer.innerHTML = "";
            if (movies.length === 0) {
                resultsContainer.innerHTML = "<div class='result-item'>Ничего не найдено</div>";
            } else {
                // Генерируем список найденных фильмов
                movies.forEach(movie => {
                    const div = document.createElement("div");
                    div.classList.add("result-item");
                    div.textContent = movie.title;

                    div.addEventListener("click", function () {
                        getRecommendations(movie.index, movie.title);
                    });
                    resultsContainer.appendChild(div);
                });
            }
            resultsContainer.style.display = "block";

        } catch (error) {
            console.error("Ошибка поиска:", error);
            resultsContainer.innerHTML = "<div class='result-item'>Ошибка загрузки</div>";
            resultsContainer.style.display = "block";
        }
    }

    // Функция получения рекомендаций от сервера
    async function getRecommendations(movieId, title) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/recommend?movie_id=${movieId}&top_n=10`);
            const data = await response.json();

            if (data.recommended_movies && data.recommended_movies.length > 0) {
                recommendedMovies = data.recommended_movies;
                currentIndex = 0;
                updateRightPanel(currentIndex);
            } else {
                // Если нет рекомендаций
                recommendedMovies = [];
                movieTitle.textContent = "Нет рекомендаций";
                imdbRating.textContent = "";
                movieDescription.textContent = "";
            }
        } catch (error) {
            console.error("Ошибка получения рекомендаций:", error);
        }

        // Скрываем список результатов и очищаем поле ввода
        resultsContainer.style.display = "none";
        searchInput.value = "";
    }

    // Функция показа конкретного фильма в right-panel
    function updateRightPanel(index) {
        if (!recommendedMovies[index]) return;

        const movie = recommendedMovies[index];
        movieTitle.textContent = movie.title || "Без названия";
        imdbRating.textContent = movie.imdb_rating || "N/A";
        movieDescription.textContent = movie.summary || "Описание отсутствует";

        // Убираем старую анимацию, чтобы при повторном нажатии она воспроизводилась заново
        rightPanel.classList.remove("fade-in");
        // Триггерим reflow (перестройку) для перезапуска анимации
        void rightPanel.offsetWidth; 
        // Добавляем класс с анимацией
        rightPanel.classList.add("fade-in");

        updateButtons();
    }

    // Обработчик ввода в поисковой строке
    searchInput.addEventListener("input", function () {
        searchMovies(this.value);
    });

    // Закрываем окно поиска при клике вне его
    document.addEventListener("click", function (event) {
        if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = "none";
        }
    });

    // Кнопка "назад"
    prevBtn.addEventListener("click", function () {
        if (recommendedMovies.length > 0 && currentIndex > 0) {
            currentIndex--;
            updateRightPanel(currentIndex);
        }
    });

    // Кнопка "вперёд"
    nextBtn.addEventListener("click", function () {
        if (recommendedMovies.length > 0 && currentIndex < recommendedMovies.length - 1) {
            currentIndex++;
            updateRightPanel(currentIndex);
        }
    });
});
