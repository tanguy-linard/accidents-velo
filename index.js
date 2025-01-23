let accidents = [];

// initialise le cluster des points	
const markers = L.markerClusterGroup({
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

document.addEventListener("DOMContentLoaded", async function (event) {
	// importation du fichier csv avec les accidents de vélo
	accidents = await d3.csv('data/bike_accidents.csv');

	// dessine la carte
	draw_map();
});

// Crée le slider
const dateSlider = document.getElementById('date-range-slider');

noUiSlider.create(dateSlider, {
    start: [2011, 2024],
    connect: true,
    range: {
        min: 2011,
        max: 2024
    },
    tooltips: {
        to: function (value) {
            return Math.round(value); // Supprime les décimales
        },
        from: function (value) {
            return value;
        }
    },
    step: 1
});

dateSlider.noUiSlider.on('change', function (values, handle) {
    update_clusters(values)
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

	update_clusters([2011, 2024]);

	// ajoute le cluster à la carte
	mymap.addLayer(markers);
}

function update_clusters(dates){
	markers.clearLayers();

	filtered_accidents = filter_accidents(dates)

	// ajoute les points au cluster
	for (var i = 0; i < filtered_accidents.length; i++) {
		var lat = filtered_accidents[i].AccidentLocation_WGS84_N;
		var lng = filtered_accidents[i].AccidentLocation_WGS84_E;
		var marker = L.circleMarker([lat, lng], {
			radius: 5, // Taille du cercle
			color: '#00a6ff', // Couleur du bord
			fillColor: '#00a6ff', // Couleur de remplissage
			fillOpacity: 0.8 // Opacité du remplissage
		});

		marker.bindTooltip(filtered_accidents[i].AccidentSeverityCategory_fr);

		markers.addLayer(marker);
	}
}

function filter_accidents(dates){
	filtered_accidents = accidents.filter(function (d) {
		return d.AccidentYear >= dates[0] && d.AccidentYear <= dates[1];
	});
	return filtered_accidents
}