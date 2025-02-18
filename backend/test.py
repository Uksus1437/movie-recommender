import requests
import pandas as pd

url_recommend = "http://127.0.0.1:5000/recommend"
processed_data = pd.read_csv("data/final_process_data.csv")

# movie = '«Чудотворец» из Бирюлёва'

# movie_id = processed_data[processed_data['title'] == movie].index[0]

# params = {"movie_id": movie_id, "top_n": 5}

# response = requests.get(url_recommend, params=params)
# data = response.json()

# print("Рекомендации:", data["recommended_movies"])


url_search = "http://127.0.0.1:5000/search"

query = 'из'
params = {"query": query}

response = requests.get(url_search, params=params)


if response.status_code == 200:
    data = response.json()
    print("Найденные фильмы:")
    for movie in data:
        print(f"{movie['index']}: {movie['title']}")
else:
    print("Ошибка:", response.status_code)