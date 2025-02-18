import pandas as pd
from scipy.sparse import load_npz
from sklearn.neighbors import NearestNeighbors
import joblib 

combined_matrix = load_npz("data/combined_matrix.npz")
processed_data = pd.read_csv("data/final_process_data.csv")

knn_model = NearestNeighbors(n_neighbors=30, metric="cosine", algorithm="brute", n_jobs=-1)
knn_model.fit(combined_matrix)

joblib.dump(knn_model, "models/knn_model.pkl")