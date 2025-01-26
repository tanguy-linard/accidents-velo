import psycopg2

# Informations de connexion
conn = psycopg2.connect(
    host="localhost",
    database="accidents_velo",
    user="votre_utilisateur",
    password="votre_mot_de_passe"
)