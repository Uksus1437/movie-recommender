from flask import Flask, request, jsonify
from scipy.sparse import load_npz
import pandas as pd
import joblib 

app = Flask(__name__)

combined_matrix = load_npz("data/combined_matrix.npz")
processed_data = pd.read_csv("data/final_process_data.csv")

knn_model = joblib.load("models/knn_model.pkl")

def find_similar_movies(movie_id, top_n=30):
    query_vector = combined_matrix[movie_id]
    distances, indices = knn_model.kneighbors(query_vector, n_neighbors=top_n)
    similar_movies = processed_data.iloc[indices[0]][["title", "genre", 'imdb_rating']].to_dict(orient="records")
    return similar_movies

@app.route("/recommend", methods=["GET"])
def recommend():
    movie_id = int(request.args.get("movie_id", 0)) 
    top_n = int(request.args.get("top_n", 30))
    if movie_id >= len(processed_data): 
        return jsonify({"error": "Фильм не найден"}), 404
    recommendations = find_similar_movies(movie_id, top_n)
    return jsonify({"movie_id": movie_id, "recommended_movies": recommendations})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
