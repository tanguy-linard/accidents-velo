import pandas as pd
from pyproj import Transformer

input_file = 'bike_accidents_LV95.csv' # nom du fichier csv à filter
output_file = 'bike_accidents.csv' # nom du fichier csv de sortie

input_crs = 'EPSG:2056'
output_crs = 'EPSG:4326'

# création du transformer
transformer = Transformer.from_crs(input_crs, output_crs, always_xy=True)

# chargement du fichier csv
data = pd.read_csv(input_file)
df = pd.DataFrame(data)

# changement de la projection
df[['AccidentLocation_WGS84_E', 'AccidentLocation_WGS84_N']] = df.apply(lambda row: transformer.transform(row['AccidentLocation_CHLV95_E'], row['AccidentLocation_CHLV95_N']), axis=1, result_type='expand')

# Enregistrement du nouveau tableau dans un fichier CSV
df.to_csv(output_file, index=False)

print('Le fichier filtré a été enregistré sous le nom ', output_file)