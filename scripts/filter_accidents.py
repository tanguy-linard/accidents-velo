import pandas as pd

input_file = 'RoadTrafficAccidentLocations.csv' # nom du fichier csv à filter

output_file = 'bike_accidents.csv' # nom du fichier csv de sortie

# chargement du fichier csv
data = pd.read_csv(input_file)
df = pd.DataFrame(data)

# filtrage des accidents
df_bike = df[df['AccidentInvolvingBicycle'] == True]
df_bike = df_bike.drop(['AccidentInvolvingBicycle'], axis=1)

# Enregistrement du nouveau tableau dans un fichier CSV
df_bike.to_csv(output_file, index=False)

print('Le fichier filtré a été enregistré sous le nom ', output_file)