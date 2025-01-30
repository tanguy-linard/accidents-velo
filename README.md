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
L’affichage de la carte et du graphique se fait dans deux onglets distincts sur la page. Le changement entre la carte et le graphique se fait à l’aide de boutons :

```html
<!-- Tabs -->
<div class="tabs">
    <button class="tab-button active" onclick="showTab('map')">Carte</button>
    <button class="tab-button" onclick="showTab('chart')">Graphique</button>
</div>
```

Les deux visualisations (carte et graphique) sont placées dans un conteneur `<div>` appelé `tab-content`, auquel est attribuée la classe `active` pour déterminer quelle vue est actuellement affichée :

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
Lorsque l'utilisateur clique sur un bouton, une fonction JavaScript désactive tous les onglets et active l’onglet sélectionné :

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

### Choix des données à afficher
L’utilisateur peut filtrer les accidents affichés selon plusieurs critères : l’année, la gravité des blessures, le type de route et le type d’accident. 

#### Sélection de l'année
Pour choisir une période, un curseur interactif est créé avec [*noUiSlider*](https://github.com/leongersen/noUiSlider) :

```js
// dates slider
const dateSlider = document.getElementById('date-range-slider');

noUiSlider.create(dateSlider, {
	start: date_range,
	connect: true,
	range: {
		min: date_range[0],
		max: date_range[1]
	},
	tooltips: {
		to: function (value) {
			return Math.round(value);
		},
		from: function (value) {
			return value;
		}
	},
	step: 1
});
```

#### Sélection des autres critères

Pour les autres filtres, l'utilisateur peut chosir les accidents à afficher grâce à des checkbox. Exemple pour la sévérité de l'accident :

```html
<!-- checkbox pour choisir la severité de l'accident -->
<div class="checkboxSeverity" style="border-top: 1px solid #c0c0c0; margin-top: 10px;">
    <h2>Sévérité de l'accident</h2>
    <input id="as3" type="checkbox" name="checkboxSeverity" value="as3" checked />
    <label for="leger">Léger</label>

    <input id="as2" type="checkbox" name="checkboxSeverity" value="as2" checked />
    <label for="grave">Grave</label>

    <input id="as1" type="checkbox" name="checkboxSeverity" value="as1" checked />
    <label for="deces">Décès</label>
</div>
```

#### Mise à jour des visualisations

Lorsque l’utilisateur modifie un filtre (curseur ou case à cocher), un événement est déclenché pour mettre à jour les graphiques. Exemple pour le slider et les checkbox de la sévérité de l'accident :
```js
// dates
dateSlider.noUiSlider.on('change', function () {
	update_charts();
});

// sévérité
document.querySelectorAll('input[name="checkboxSeverity"]').forEach(function (checkbox) {
	checkbox.addEventListener('change', function () {
		update_charts();
	});
});
```
La fonction `update_charts` applique les filtres et met à jour les visualisations :

```js
function update_charts() {
	filtered_accidents = filter_accidents(accidents);
	update_clusters(filtered_accidents);
	draw_chart(filtered_accidents);
}
```

La fonction `filter_accidents` sélectionne les accidents en fonction des filtres définis en regardant l'état des checkboxs :

```js
function filter_accidents() {
	dates = dateSlider.noUiSlider.get().map(Number);

	severities = Array.from(document.querySelectorAll('.checkboxSeverity input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

	roads = Array.from(document.querySelectorAll('.checkboxRoad input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

	types = Array.from(document.querySelectorAll('.checkboxType input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

	filtered_accidents = accidents.filter(function (d) {
		return d.AccidentYear >= dates[0] && d.AccidentYear <= dates[1] && severities.includes(d.AccidentSeverityCategory) && roads.includes(d.RoadType) && types.includes(d.AccidentType);
	});
	return filtered_accidents
}
```

Les fonctions `update_clusters` et `draw_chart` mettent à jour respectivement la  [carte](#carte) et le [graphique](#graphique).

### Carte
La carte est générée à l'aide de [Leaflet](https://leafletjs.com/). Un fond de carte de ArcGIS est ajouté :

```js
// fond de carte
var background_map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});
background_map.addTo(mymap);
```
Ensuite la fonction `update_clusters` permet d'ajouter et mettre à jour les clusters. Dans cette fonction, chaque point est ajouté à `markers = L.markerClusterGroup({})` à l'aide de :

```js
// ajoute les points au cluster
for (var i = 0; i < filtered_accidents.length; i++) {
	var lat = filtered_accidents[i].AccidentLocation_WGS84_N;
	var lng = filtered_accidents[i].AccidentLocation_WGS84_E;
	var marker = L.circleMarker([lat, lng], {
		radius: 5,
		color: '#3eb8ae',
		fillColor: '#3eb8ae',
		fillOpacity: 0.8
	});

    // donnees de l'accident
	marker.accident_data = filtered_accidents[i];

	// tooltip
	marker.bindTooltip(
		filtered_accidents[i].AccidentSeverityCategory_fr.charAt(0).toUpperCase() + filtered_accidents[i].AccidentSeverityCategory_fr.slice(1)
	);

	// gestionnaire d'événement pour le clic
	marker.on('click', function () {
		display_accident_data(this.accident_data);
	});

	markers.addLayer(marker);
}
```

La méthode `marker.blinTooltip` ajoute un infobulle affichant la gravité de l’accident lorsque l’utilisateur passe la souris dessus.

Enfin, `marker.on('click')`  permet d’afficher les détails de l’accident sélectionné en appelant la fonction `display_accident_data`.

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
