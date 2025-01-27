let accidents = [];

// compteur du nombre de fois que l'animation de l'infobox a été executée, on limite à 3
var animation_count = 0;

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
            return Math.round(value);
        },
        from: function (value) {
            return value;
        }
    },
    step: 1
});

dateSlider.noUiSlider.on('change', function () {
    update_clusters()
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

function update_clusters(){

	// vide le cluster
	markers.clearLayers();

	// filtre les accidents
	filtered_accidents = filter_accidents()

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

		// donnees de l'accident
		marker.accident_data = filtered_accidents[i];
		
		// tooltip
		marker.bindTooltip(
			filtered_accidents[i].AccidentSeverityCategory_fr.charAt(0).toUpperCase() +
			filtered_accidents[i].AccidentSeverityCategory_fr.slice(1)
		);

		// gestionnaire d'événement pour le clic
		marker.on('click', function () {
			display_accident_data(this.accident_data);
		});

		markers.addLayer(marker);
	}
}

function filter_accidents(){
	dates = dateSlider.noUiSlider.get().map(Number);

	severities = Array.from(document.querySelectorAll('.checkboxSeverity input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

	roads = Array.from(document.querySelectorAll('.checkboxRoad input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

	filtered_accidents = accidents.filter(function (d) {
		return d.AccidentYear >= dates[0] && d.AccidentYear <= dates[1] && severities.includes(d.AccidentSeverityCategory) && roads.includes(d.RoadType);
	});
	return filtered_accidents
}
/*
// ecouteur d'événements
*/
// sévérité
document.querySelectorAll('input[name="checkboxSeverity"]').forEach(function(checkbox) {
	checkbox.addEventListener('change', function() {
		update_clusters();
	});
  });

// route
document.querySelectorAll('input[name="checkboxRoad"]').forEach(function(checkbox) {
	checkbox.addEventListener('change', function() {
		console.log("change")
		update_clusters();
	});
  });

// change le texte dans l'infobox en fonction de l'accident sélectionné
function display_accident_data(accident){

	month = accident.AccidentMonth_fr.charAt(0).toUpperCase() + accident.AccidentMonth_fr.slice(1);
	year = accident.AccidentYear
	weekday = accident.AccidentWeekDay_fr.charAt(0).toUpperCase() + accident.AccidentWeekDay_fr.slice(1);
	hour = Math.floor(accident.AccidentHour) + 'h';
	type = accident.AccidentType_fr.charAt(0).toUpperCase() + accident.AccidentType_fr.slice(1);
	severity = accident.AccidentSeverityCategory_fr.charAt(0).toUpperCase() + accident.AccidentSeverityCategory_fr.slice(1);
	road = accident.RoadType_fr.charAt(0).toUpperCase() + accident.RoadType_fr.slice(1);
  
	// cree le contenu de l'infobox a partir des donnees
	var text = '<table class="infotable">';
	text += '<tr>';
	text +=   '<td class="label"><b>Mois et année:</b></td>';
	text +=   '<td>' + month + ' ' + year + '</td>';
	text += '</tr><tr>';
	text +=   '<td class="label"><b>Jour de la semaine:</b></td>';
	text +=   '<td>' + weekday + '</td>';
	text += '</tr><tr>';
	text +=   '<td class="label"><b>Heure:</b></td>';
	text +=   '<td>' + hour + '</td>';
	text += '</tr><tr>';
	text +=   '<td class="label"><b>Type d\'accident:</b></td>';
	text +=   '<td>' + type + '</td>';
	text += '</tr><tr>';
	text +=   '<td class="label"><b>Sévérité:</b></td>';
	text +=   '<td>' + severity + '</td>';
	text += '</tr><tr>';
	text +=   '<td class="label"><b>Type de route:</b></td>';
	text +=   '<td>' + road + '</td>';
	text += '</tr><tr>';
	
	// remplace le texte dans l'infobox
	$('.infobox').html(text);
  
	// animation de l'infobox pour les 3 premieres regions selectionnees
	if (animation_count < 3) {
	  for (let i = 0; i < 3; i++) {
		$('.infobox').fadeOut(250).fadeIn(250);
	  }
	  animation_count += 1;
	}
  }