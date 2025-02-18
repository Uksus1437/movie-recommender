import requests

url = "http://127.0.0.1:5000/recommend"
params = {"movie_id": 11, "top_n": 10}

response = requests.get(url, params=params)
data = response.json()

print("Рекомендации:", data["recommended_movies"])
