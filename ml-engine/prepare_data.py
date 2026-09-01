import pandas as pd
import numpy as np
import glob
from sklearn.preprocessing import RobustScaler
import joblib

csv_files=glob.glob("data/*.csv")
print(f"Found {len(csv_files)} files")

df_list=[pd.read_csv(f) for f in csv_files]
df=pd.concat(df_list, ignore_index=True)
print(f"Combined shape: {df.shape}")

df.columns=df.columns.str.strip()

df['Label']=df["Label"].str.strip()

df.replace([np.inf, -np.inf], np.nan, inplace=True)
df.dropna(inplace=True)
print(f"Shape after claening: {df.shape}")

feature_cols= df.select_dtypes(include=[np.number]).columns.tolist()
X= df[feature_cols]
y=df['Label']

scaler=RobustScaler()
X_scaled= scaler.fit_transform(X)

joblib.dump(scaler, "scaler.joblib")
joblib.dump(feature_cols, "feature_cols.joblib")
np.save("X_scaled.npy", X_scaled)
y.to_csv("labels.csv", index=False)

print("Done. Ready for Training")