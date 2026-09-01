from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

model=joblib.load("isolation_forest.joblib")
scaler=joblib.load("scaler.joblib")
feature_cols=joblib.load("feature_cols.joblib")

app=FastAPI()

class NetworkFlow(BaseModel):
    features:dict

@app.post("/predict")
def predict(flow: NetworkFlow):
     row=[flow.features.get(col, 0) for col in feature_cols]
     row=np.array(row).reshape(1, -1)
     row_scaled=scaler.transform(row)

     prediction=model.predict(row_scaled)[0]
     score=model.decision_function(row_scaled)[0]

     return {
         "is_anomaly": bool(prediction == -1),
         "anomaly_score": float(score)

       }

@app.get("/")
def health():
     return {"status": "ML Engine is running"}