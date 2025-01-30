/* 
	variables globales
*/
let accidents = [];

// dates
const date_range = [2011, 2023];

// compteur du nombre de fois que l'animation de l'infobox a été executée, on limite à 3
var animation_count = 0;

// initialise le cluster des points	
const markers = L.markerClusterGroup({});

/*
	écouteur d'événements
*/
// charger données et initialiser la carte et le graphique
document.addEventListener("DOMContentLoaded", async function (event) {
	// importation du fichier csv avec les accidents de vélo
	accidents = await d3.csv('data/bike_accidents.csv');

	// dessine la carte
	draw_map();

	// dessine le graphique
	draw_chart(accidents)
});

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

dateSlider.noUiSlider.on('change', function () {
	update_charts();
});

// sévérité
document.querySelectorAll('input[name="checkboxSeverity"]').forEach(function (checkbox) {
	checkbox.addEventListener('change', function () {
		update_charts();
	});
});

// route
document.querySelectorAll('input[name="checkboxRoad"]').forEach(function (checkbox) {
	checkbox.addEventListener('change', function () {
		update_charts();
	});
});

// type
document.querySelectorAll('input[name="checkboxType"]').forEach(function (checkbox) {
	checkbox.addEventListener('change', function () {
		update_charts();
	});
});

function showTab(tabId) {
	// Masquer tous les contenus
	document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
	document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

	// Afficher le bon onglet
	document.getElementById(tabId).classList.add('active');
	document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function update_charts() {
	filtered_accidents = filter_accidents(accidents);
	update_clusters(filtered_accidents);
	draw_chart(filtered_accidents);
}

/*
	traitement des données
*/
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

function count_accidents(filtered_accidents) {
	// Crée un dictionnaire pour compter les accidents par mois et année
	let monthly_accidents = {};

	filtered_accidents.forEach(d => {
		let year = d.AccidentYear;
		let month = d.AccidentMonth; // Assure-toi que la colonne est bien `AccidentMonth`

		// Utilise une clé pour combiner l'année et le mois
		let key = `${year}-${month}`;

		// Si cette clé n'existe pas, crée-la et initialise avec 0
		if (!monthly_accidents[key]) {
			monthly_accidents[key] = 0;
		}

		// Incrémente le nombre d'accidents pour ce mois
		monthly_accidents[key]++;
	});

	// Transforme l'objet en tableau avec `year-month` comme clé et `count` comme valeur
	let accident_count = [];
	for (let key in monthly_accidents) {
		let [year, month] = key.split("-");
		accident_count.push({
			year: parseInt(year),
			month: parseInt(month),
			count: monthly_accidents[key]
		});
	}

	// Trie par date (année, puis mois)
	accident_count.sort((a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1));

	return accident_count;
}

function accumulate_accidents(accident_count) {
	let cumulative_accidents = [];
	let cumulative_count = 0;

	// Cumul des accidents
	accident_count.forEach(d => {
		cumulative_count += d.count; // Ajoute le nombre d'accidents du mois courant
		cumulative_accidents.push({
			...d,
			cumulativeCount: cumulative_count // Ajoute le total cumulé
		});
	});

	return cumulative_accidents;
}

/* 
	carte
*/
function draw_map() {

	// initialise la carte
	var mymap = L.map('map-container');
	mymap.setView([46.82, 8.28], 8);
	mymap.setMinZoom(8);
	mymap.setMaxBounds([[48.76, 12.68], [44.81, 3.89]]);

	// fond de carte
	var background_map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
		maxZoom: 16
	});
	background_map.addTo(mymap);

	// ajoute les points au cluster
	update_clusters(accidents);

	// ajoute le cluster à la carte
	mymap.addLayer(markers);
}

function update_clusters(filtered_accidents) {

	// vide le cluster
	markers.clearLayers();

	// ajoute les points au cluster
	for (var i = 0; i < filtered_accidents.length; i++) {
		var lat = filtered_accidents[i].AccidentLocation_WGS84_N;
		var lng = filtered_accidents[i].AccidentLocation_WGS84_E;
		var marker = L.circleMarker([lat, lng], {
			radius: 5,
			color: '#3eb8ae',
			opacity: 0.6,
			fillColor: '#3eb8ae',
			fillOpacity: 1
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

/*
	graphique
*/
function draw_chart(filtered_accidents) {

	// compte accidents
	cumulative_accidents = accumulate_accidents(count_accidents(filtered_accidents));

	cumulative_accidents.forEach(d => {
		d.date = new Date(d.year, d.month - 1);
	});

	const minDate = d3.min(cumulative_accidents, d => d.date);
	const maxDate = d3.max(cumulative_accidents, d => d.date);

	// dimensions
	const dim_container = d3.select(".tab-content")
	const margin = { top: 40, right: 70, bottom: 70, left: 70 };
	const width = parseInt(dim_container.style("width"));
	const height = parseInt(dim_container.style("height"));
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// svg container et vide le contenu
	d3.select("#chart-container").selectAll("*").remove();
	const container = d3.select("#chart-container")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// groupe svg
	const chart = container.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	// echelles
	const xScale = d3.scaleBand()
		.domain(cumulative_accidents.map(d => d.date))
		.range([0, innerWidth])
		.padding(0.1);

	const yScale_cumulative = d3.scaleLinear()
		.domain([0, d3.max(cumulative_accidents, d => d.cumulativeCount)])
		.nice()
		.range([innerHeight, 0]);

	const yScale_count = d3.scaleLinear()
		.domain([0, d3.max(cumulative_accidents, d => d.count)])
		.nice()
		.range([innerHeight, 0]);

	// axe x
	const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y"))
		.tickValues(xScale.domain().filter((d, i) => i % 6 === 0));

	chart.append("g")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(xAxis)
		.selectAll("text")
		.attr("transform", "rotate(-45)")
		.style("text-anchor", "end");

	// axes y
	const yAxis_cumulative = d3.axisLeft(yScale_cumulative);
	chart.append("g").call(yAxis_cumulative);

	const yAxis_count = d3.axisRight(yScale_count).ticks(5);
	chart.append("g")
		.attr("transform", `translate(${innerWidth}, 0)`)
		.call(yAxis_count);

	// crée les bars
	chart.selectAll(".bar")
		.data(cumulative_accidents)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", d => xScale(d.date))
		.attr("y", d => yScale_count(d.count))
		.attr("width", xScale.bandwidth())
		.attr("height", d => innerHeight - yScale_count(d.count))
		.attr("fill", "LightSteelBlue")
		.attr("opacity", 0.6)
		.on("mouseover", function (event, d) {
			tooltip.style("display", "block")
				.html(`Mois: ${d3.timeFormat("%b %Y")(d.date)}<br>Accidents: ${d.count}`)
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY - 30}px`);

			d3.select(this).attr("opacity", 1);
		})
		.on("mouseout", function () {
			tooltip.style("display", "none");

			d3.select(this).attr("opacity", 0.6);
		});

	// créer la ligne
	const line = d3.line()
		.x(d => xScale(d.date))
		.y(d => yScale_cumulative(d.cumulativeCount))
		.curve(d3.curveMonotoneX);

	// ajouter la ligne au graphique
	chart.append("path")
		.datum(cumulative_accidents)
		.attr("fill", "none")
		.attr("stroke", "#3eb8ae")
		.attr("stroke-width", 5)
		.attr("d", line);

	// ajouter des cercles sur chaque point de la ligne pour le tooltip
	chart.selectAll(".dot")
		.data(cumulative_accidents)
		.enter()
		.append("circle")
		.attr("class", "dot")
		.attr("cx", d => xScale(d.date))
		.attr("cy", d => yScale_cumulative(d.cumulativeCount))
		.attr("r", 5)
		.attr("fill", "transparent")
		.on("mouseover", function (event, d) {
			tooltip.style("display", "block")
				.html(`Mois: ${d3.timeFormat("%b %Y")(d.date)}<br>Accidents cumulés: ${d.cumulativeCount}`)
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY - 30}px`);

			d3.select(this).attr("fill", "#3eb8ae");
		})
		.on("mouseout", function () {
			tooltip.style("display", "none");

			d3.select(this).attr("fill", "transparent");
		});

	// tooltip
	const tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("background", "white")
		.style("border", "1px solid #ccc")
		.style("padding", "5px")
		.style("border-radius", "5px")
		.style("display", "none")
		.style("font-size", "12px");

	// titre de l'axe X
	chart.append("text")
		.attr("class", "x-axis-title")
		.attr("x", innerWidth / 2)
		.attr("y", innerHeight + margin.bottom - 10)
		.attr("text-anchor", "middle")
		.style("font-size", "14px")
		.text("Mois");

	// titre de l'axe Y (nombre d'accidents cumulés)
	chart.append("text")
		.attr("class", "y-axis-title")
		.attr("x", -innerHeight / 2)
		.attr("y", -margin.left + 20)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.style("font-size", "14px")
		.text("Accidents Cumulés");

	// titre de l'axe Y droit (nombre d'accidents mensuels)
	chart.append("text")
		.attr("class", "y-axis-title")
		.attr("x", -innerHeight / 2)
		.attr("y", innerWidth + margin.right - 20)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.style("font-size", "14px")
		.text("Accidents par mois");
}

/*
	infobox
*/
// change le texte dans l'infobox en fonction de l'accident sélectionné
function display_accident_data(accident) {

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
	text += '<td class="label"><b>Mois et année:</b></td>';
	text += '<td>' + month + ' ' + year + '</td>';
	text += '</tr><tr>';
	text += '<td class="label"><b>Jour:</b></td>';
	text += '<td>' + weekday + '</td>';
	text += '</tr><tr>';
	text += '<td class="label"><b>Heure:</b></td>';
	text += '<td>' + hour + '</td>';
	text += '</tr><tr>';
	text += '<td class="label"><b>Type d\'accident:</b></td>';
	text += '<td>' + type + '</td>';
	text += '</tr><tr>';
	text += '<td class="label"><b>Sévérité:</b></td>';
	text += '<td>' + severity + '</td>';
	text += '</tr><tr>';
	text += '<td class="label"><b>Type de route:</b></td>';
	text += '<td>' + road + '</td>';
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