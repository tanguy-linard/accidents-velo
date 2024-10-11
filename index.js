let bike_accidents = [];

document.addEventListener("DOMContentLoaded", async function (event) {
	// importation du fichier csv avec les accidents de vélo
	bike_accidents = await d3.csv('data/bike_accidents.csv');

	// dessine la carte
	draw_map();
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

	// // dessine les points
	// for (var i = 0; i < 1000; i++) {
	// 	L.marker([bike_accidents[i].AccidentLocation_WGS84_N, bike_accidents[i].AccidentLocation_WGS84_E]).addTo(mymap);
	// }

	// initialise le cluster des points	
	markers = L.markerClusterGroup();

	// ajoute les points au cluster
	for (var i = 0; i < bike_accidents.length; i++) {
		var lat = bike_accidents[i].AccidentLocation_WGS84_N;
		var lng = bike_accidents[i].AccidentLocation_WGS84_E;
		var marker = L.circleMarker([lat, lng], {
			radius: 5, // Taille du cercle
			color: 'red', // Couleur du bord
			fillColor: 'red', // Couleur de remplissage
			fillOpacity: 1 // Opacité du remplissage
		});
		markers.addLayer(marker);
	}

	// ajoute le cluster à la carte
	mymap.addLayer(markers);
}