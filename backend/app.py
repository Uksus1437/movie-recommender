from flask import Flask, request, jsonify
from scipy.sparse import load_npz
import pandas as pd
import joblib 
from flask_cors import CORS
import ast

app = Flask(__name__)
CORS(app) 

combined_matrix = load_npz("data/combined_matrix.npz")
processed_data = pd.read_csv("data/final_process_data.csv")

knn_model = joblib.load("models/knn_model.pkl")

def find_similar_movies(movie_id, top_n=100):
    query_vector = combined_matrix[movie_id]
    distances, indices = knn_model.kneighbors(query_vector, n_neighbors=top_n+1)
    similar_movies = processed_data.iloc[indices[0]][["title", "genre", 'imdb_rating', 'summary']].to_dict(orient="records")
    return similar_movies

@app.route("/recommend", methods=["GET"])
def recommend():
    movie_id = int(request.args.get("movie_id", 0)) 
    top_n = int(request.args.get("top_n", 10))
    genres_str = request.args.get("genres", "").strip()
    min_rating_str = request.args.get("min_rating", "")
    max_rating_str = request.args.get("max_rating", "")
    

    user_genres = [g.strip().lower() for g in genres_str.split(",") if g.strip()]   # тут нужна строка вида: "Исторический,Спортивный"  

    try:
        min_rating = float(min_rating_str) if min_rating_str else 0.0
        max_rating = float(max_rating_str) if max_rating_str else 10.0
    except ValueError:
        return jsonify({"error": "Неверный формат рейтинга"}), 400


    if movie_id >= len(processed_data): 
        return jsonify({"error": "Фильм не найден"}), 404

    large_n = 100  
    recommendations = find_similar_movies(movie_id, large_n)
    recommendations = recommendations[1:]  

    # Фильтр по жанрам
    if user_genres:
        filtered = []
        for rec in recommendations:
            raw = rec["genre"]
            try:
                movie_genres = ast.literal_eval(raw)
            except:
                movie_genres = []
            if any(g in movie_genres for g in user_genres):
                filtered.append(rec)
        recommendations = filtered

    # Фильтр по рейтингу
    filtered_by_rating = []
    for rec in recommendations:
        rating_val = rec["imdb_rating"]
        if pd.isna(rating_val):
            continue
        if min_rating <= float(rating_val) <= max_rating:
            filtered_by_rating.append(rec)

    recommendations = filtered_by_rating

    recommendations = recommendations[:top_n]

    return jsonify({"movie_id": movie_id, "recommended_movies": recommendations})


@app.route("/search", methods=["GET"])
def search_movies():
    query = request.args.get("query", "").strip().lower()
    if not query:
        return jsonify([])

    matches = processed_data[processed_data["title"].str.lower().str.contains(query)]

    results = matches[["title"]].head(20).copy()
    results["index"] = results.index

    return jsonify(results.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
