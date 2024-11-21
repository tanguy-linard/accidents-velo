let accidents = [];

document.addEventListener("DOMContentLoaded", async function (event) {
	// importation du fichier csv avec les accidents de vélo
	accidents = await d3.csv('data/bike_accidents.csv');

	// dessine la carte
	draw_map();
});

// Crée le slider
const dateSlider = document.getElementById('date-range-slider');

noUiSlider.create(dateSlider, {
    start: [2011, 2024], // Plage initiale
    connect: true, // Colore la plage sélectionnée
    range: {
        min: 2011,
        max: 2024
    },
    tooltips: true, // Affiche les valeurs lors du glissement
    step: 1 // Étape d'un jour en millisecondes
});

/* 
  dessine la carte
*/
function draw_map() {

	// initialise la carte
	var mymap = L.map('map');
	mymap.setView([46.82, 8.28], 8);
	mymap.setMinZoom(8);
	mymap.setMaxBounds([[48.76, 12.68], [44.81, 3.89]]);

	// fond de carte
	var background_map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
		maxZoom: 16
	});
	background_map.addTo(mymap);

	// dessine les points

	// initialise le cluster des points	
	markers = L.markerClusterGroup({
		// iconCreateFunction: function (cluster) {
		// 	var count = cluster.getChildCount();
		// 	var k = 0.001; // taille du cluster
		// 	var zoom = mymap.getZoom();

		// 	return L.divIcon({
		// 		html: `<div class="cluster-count">${count}</div>`,
		// 		className: 'cluster-icon',
		// 		iconSize: L.point(40, 40)
		// 	});
		// }
	});

	// ajoute les points au cluster
	for (var i = 0; i < accidents.length; i++) {
		var lat = accidents[i].AccidentLocation_WGS84_N;
		var lng = accidents[i].AccidentLocation_WGS84_E;
		var marker = L.circleMarker([lat, lng], {
			radius: 5, // Taille du cercle
			color: 'blue', // Couleur du bord
			fillColor: 'blue', // Couleur de remplissage
			fillOpacity: 1 // Opacité du remplissage
		});

		marker.bindTooltip(accidents[i].AccidentSeverityCategory_fr);

		markers.addLayer(marker);
	}

	// ajoute le cluster à la carte
	mymap.addLayer(markers);
}