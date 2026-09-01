import pandas as pd
y=pd.read_csv("labels.csv")
print(y['Label'].value_counts(normalize= True))