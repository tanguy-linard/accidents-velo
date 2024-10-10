
// importation du fichier csv avec les accidents de vélo
bike_accidents = [];
document.addEventListener("DOMContentLoaded", async function (event) {
	bike_accidents = await d3.csv('data/bike_accidents.csv');
});

// dessine la carte
draw_map();

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

	// cherche coordonnées des accidents de vélo
	

	// dessine les points
}