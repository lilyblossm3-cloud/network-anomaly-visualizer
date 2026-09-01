import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

X_scaled=np.load("X_scaled.npy")
y=pd.read_csv("labels.csv")['Label']
print(f"Loaded {X_scaled.shape[0]} rows, {X_scaled.shape[1]} features")


model=IsolationForest(
    n_estimators=100,
    contamination=0.197,
    random_state=42,
    n_jobs= -1
)
model.fit(X_scaled)
print("Traing Complete")

predictions=model.predict(X_scaled)

is_anomaly= predictions == -1

y_true_anomaly=(y != "BENIGN")

print("\nModel flagged as anomaly", is_anomaly.sum())
print("Actually anomalies (non-BENIGN):", y_true_anomaly.sum())

overlap=(is_anomaly & y_true_anomaly.values).sum()
print(f"Overlap(corectly cought): {overlap}")
print(f"Recall(% of real attcks caught): {overlap/ y_true_anomaly.sum(): .2%}")

joblib.dump(model, "isolation_forest.joblib")
print("\nModel saved to isolation_forest.joblib")