# Carte Interactive des Accidents à Vélo en Suisse
## Objectif
L'objectif de ce projet est de créer une visualisatiin interactive des accidents à vélo en Suisse entre 2011 et 2023.

## Public cible

Le projet s'adresse à différents acteurs impliqués dans la gestion et la prévention des risques liés aux accidents et aux événements de pluies extrêmes.

- **Décideur.eurses politiques** : Les élus et responsables politiques qui prennent des décisions en matière de sécurité publique et d'aménagement du territoire.
  
- **Services de prévention** : Les organisations et institutions dédiées à la prévention des accidents afin d'optimiser leurs interventions et leurs politiques de prévention.
  
- **Chercheur.euses** : Les chercheurs dans le domaine de la géographie, de l'environnement et des sciences sociales afin d'aider dans créeation de leurs modèles et l'analyse.
  
- **Urbanistes** : Les professionnels en charge de l'aménagement urbain, qui peuvent utilisé la visualisation afin créer des infrastructures et des espaces publics adaptés aux risques d'accidents.

## Technologies Utilisées

- **Python (pandas, pyroj)**: Prtraitrement des données
- **HTML/CSS/JavaScript**: Base pour le développement web
- **Leaflet**: Bibliothèque JavaScript pour la carte interactive
- **D3.js**: Bibliothèque JavaScript pour créer les graphes

## Prétraitement
### Filtrage des accidents
Les données sur les accidents comprends tous les accidents routiers avec dommage corporels. Il faut donc filter les accidents afin de seulement garder les accidents qui incluent un vélo. Avec [*pandas*](https://pandas.pydata.org/), ccette opération peut être réalisée facilement avec un script Python :

```python
df_bike = df[df['AccidentInvolvingBicycle'] == True]
```

### Changement de CRS
Le CRS utislié dans les données est LV95. Afin de faciliter l'ulitsaition des donnnées dans Leaflet, il faut convertir les coordnonnées en WGS84. Le module `Transformer` de [*pyproj*](https://pyproj4.github.io/pyproj/stable/) permet de réaliser cette conversion facilement :

```python
# création du transformer
transformer = Transformer.from_crs(input_crs, output_crs, always_xy=True)

# changement de la projection
df[['AccidentLocation_WGS84_E', 'AccidentLocation_WGS84_N']] = df.apply(lambda row: transformer.transform(row['AccidentLocation_CHLV95_E'], row['AccidentLocation_CHLV95_N']), axis=1, result_type='expand'
```

## Fonctionnement
### Onglets
L'afficahge de la carte et du graphique se font sur deux onglets différentes de la page. Le changement entre la carte et le grahe se fait à l'ade de boutons :

```html
<!-- Tabs -->
<div class="tabs">
    <button class="tab-button active" onclick="showTab('map')">Carte</button>
    <button class="tab-button" onclick="showTab('chart')">Graphique</button>
</div>
```

et les deux visualisations sont dans un div `tab-content`, qui peut être `active` ou non:

```html
<!-- Conteneur pour la carte et le graphique -->
    <div class="tab-content">
        <div id="map" class="tab-pane active">
            <div id="map-container"></div>
        </div>

        <div id="chart" class="tab-pane">
            <div id="chart-container"></div>
        </div>
    </div>
```
Lorsque l'utilisateur appuie sur un bouton, un fonction désactive tous les onglets et ensuite active l'onglet sélectionné:

```js
function showTab(tabId) {
    // Masquer tous les contenus
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

    // Afficher le bon onglet
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}
```


### Choic des données à afficher

### Carte

### Graphique

## Utilisation
### Windows
1. Téléchargez le fichier ZIP et décompressez-le dans un dossier de votre choix.
2. Ouvrez l'invite de commandes et naviguez jusqu'au dossier extrait : `cd C:\Users\VotreNomUtilisateur\DossierDeVotreChoix\NomDuDossier`
3. Démarrez un serveur local avec Python : `python -m http.server`
4. Ouvrez votre navigateur web et allez à l'adresse : `http://0.0.0.0:8000/`

### MacOS
1. Téléchargez le fichier ZIP et extrayez-le dans un dossier de votre choix.
2. Ouvrez le Terminal et naviguez jusqu'au dossier extrait : `cd /Users/VotreNomUtilisateur/DossierDeVotreChoix/NomDuDossier`
3. Lancez un serveur local avec Python : `python3 -m http.server`
4. Ouvrez votre navigateur web et allez à l'adresse : `http://0.0.0.0:8000/`

Il peut aussi être visualisé [ici](https://tanguy-linard.github.io/accidents-velo)

## Source des Données

**Accidents à Vélo**: Fournies par l'Office fédéral des routes OFROU sur [data.geo.admin.ch](https://data.geo.admin.ch/ch.astra.unfaelle-personenschaeden_alle/).

 Les données peuvent être visualisées sur cette [carte](https://map.geo.admin.ch/#/map?lang=fr&center=2625230.81,1201143.54&z=1.765&topic=ech&layers=ch.astra.unfaelle-personenschaeden_fahrraeder@year=all&bgLayer=ch.swisstopo.pixelkarte-farbe).

## Auteur
Tanguy Linard, 2025
