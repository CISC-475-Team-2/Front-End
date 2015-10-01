
// globals
var isEdit = false;

// Create the map
var map = new L.Map('map', {
	center: new L.LatLng(49.41923, 8.6783),
	zoom: 19,
	minZoom:16,
	maxZoom: 22
});

var office = 1;
var level = 1;

// preload all of the maps
var imageUrl, imageBounds = [[49.41873, 8.67689], [49.41973, 8.67959]];;

imageUrl = 'images/office2Level1.png';
var office2Level1 = L.imageOverlay(imageUrl, imageBounds).addTo(map);

imageUrl = 'images/sample-map-f2.png';
var office1Level2 = L.imageOverlay(imageUrl, imageBounds).addTo(map);

imageUrl = 'images/sample-map-f3.png';
var office1Level3 = L.imageOverlay(imageUrl, imageBounds).addTo(map);

imageUrl = 'images/sample-map-f4.png';
var office1Level4 = L.imageOverlay(imageUrl, imageBounds).addTo(map);

imageUrl = 'images/sample-map-f1.png';
var office1Level1 = L.imageOverlay(imageUrl, imageBounds).addTo(map);

function onEachFeature(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties && feature.properties.popupContent) {
		layer.bindPopup(feature.properties.popupContent);
		
		// if clicked open popup but also set a flag so mouseout doesn't close popup
		layer.on('click', function(e){
			this.clicked = true;
			this.openPopup();
		});
		
		// unset clicked flag so mouseout works properly after a click event
		layer.on('popupclose', function(e){
			this.clicked = false;
		});
		
		layer.on('mouseover', function(e){
			this.openPopup();
		});
		
		layer.on('mouseout', function(e){
			if(!this.clicked){
				this.closePopup();
			}
		});
		
		layer.on('contextmenu', function(e){
			alert("Delete?");
		});
	}
}


// MARKERS ----------------------------------------------------//

var geojsonFeature;  // a place to store our json loaded from server
var markerLayer;
var geojsonMarkerOptions;
var indoorLayer;
var levelControl;

var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			geojsonFeature = JSON.parse(xhttp.responseText);
			
			geojsonMarkerOptions = L.icon({
				iconUrl: 'leaflet/images/marker-icon.png',
				shadowUrl: 'leaflet/images/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -41],
				shadowSize: [41, 41]
			});
			
			/*markerLayer = L.geoJson(geojsonFeature, {
				onEachFeature: onEachFeature,
				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {icon: geojsonMarkerOptions});
				}
			}).addTo(map);
			*/
			// where data is a GeoJSON feature collection
			indoorLayer = new L.Indoor(geojsonFeature, {
				onEachFeature: onEachFeature,
				pointToLayer: function (feature, latlng) {
						return L.marker(latlng, {icon: geojsonMarkerOptions});
				},
				filter: function(feature, layer) {
					if(feature.properties.office == 1){
						return true;
					}
					else{
						return false;
					}
				}
			});

			// set the initial level to show
			indoorLayer.setLevel("1");

			indoorLayer.addTo(map);

			levelControl = new L.Control.Level({
				level: "1",
				levels: indoorLayer.getLevels()
			});

			// Connect the level control to the indoor layer
			levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);
			levelControl.addEventListener("levelchange", changeMap);
			
			levelControl.addTo(map);
		}
	}
	xhttp.open("GET", "js/data.json", true);
	xhttp.send();
	
	function changeMap(e){
		isEdit = false;
		var imageUrl, imageBounds;
		if(office == 1){
			indoorLayer.setLevel(e.newLevel);
			switch(e.newLevel){
				case 1:
					office1Level1.bringToFront();
					level = 1;
					break;
				case 2:
					office1Level2.bringToFront();
					level = 2;
					break;
				case 3:
					office1Level3.bringToFront();
					level = 3;
					break;
				case 4:
					office1Level4.bringToFront();
					level = 4;
					break;
				default:
					office1Level1.bringToFront();
					break;
			}
		}
		return false;
	}
	
document.getElementById('office1').addEventListener('click', function(){
	document.getElementById('office1').classList.add("active");
	document.getElementById('office2').classList.remove("active");
	office = 1;
	office1Level1.bringToFront();
	
		map.removeLayer(indoorLayer);
	indoorLayer = new L.Indoor(geojsonFeature, {
				onEachFeature: onEachFeature,
				pointToLayer: function (feature, latlng) {
						return L.marker(latlng, {icon: geojsonMarkerOptions});
				},
				filter: function(feature, layer) {
					if(feature.properties.office == 1){
						return true;
					}
					else{
						return false;
					}
				}
			});

			// set the initial level to show
			indoorLayer.setLevel("1");

			indoorLayer.addTo(map);
			
			try{
				levelControl.removeFrom(map);
			}
			catch(e){
				// its already removed, just ignore.
			}
			levelControl = new L.Control.Level({
				level: "1",
				levels: indoorLayer.getLevels()
			});

			// Connect the level control to the indoor layer
			levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);
			levelControl.addEventListener("levelchange", changeMap);
			
			levelControl.addTo(map);
	
}, false);

document.getElementById('office2').addEventListener('click', function(){
	document.getElementById('office2').classList.add("active");
	document.getElementById('office1').classList.remove("active");
	office = 2;
	office2Level1.bringToFront();
	
	map.removeLayer(indoorLayer);
	indoorLayer = new L.Indoor(geojsonFeature, {
				onEachFeature: onEachFeature,
				pointToLayer: function (feature, latlng) {
						return L.marker(latlng, {icon: geojsonMarkerOptions});
				},
				filter: function(feature, layer) {
					if(feature.properties.office == 1){
						return false;
					}
					else{
						return true;
					}
				}
			});

			// set the initial level to show
			indoorLayer.setLevel("1");

			indoorLayer.addTo(map);
			
			levelControl.removeFrom(map);
}, false);
	
	
// register a listener on the save json button to fire off the server script and save to file
document.getElementById('btnSaveJson').addEventListener('click', function() {
	var encoded = JSON.stringify(geojsonFeature);
	var xhr = new XMLHttpRequest();
	xhr.open('POST','saveJSON.php',true);
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send('json=' + encoded);
}, false);

document.getElementById('btnEditMap').addEventListener('click', function(){
	if(isEdit){
		isEdit = false;
	}
	else{
		isEdit = true;
	}
}, false);


// for testing lat and long
function onMapClick(e) {
	//alert("You clicked the map at " + e.latlng);
	console.log(e);
	if(isEdit){
		geojsonFeature.features.push({
			"type": "Feature",
			"properties": {
				"office": office,
				"level": level,
				"port": "44A",
				"user": "Alice Bob",
				"email": "abob@someplace.net",
				"phone": "302-555-5555",
				"popupContent": "<strong>Port 44A</strong><br>John Doe (id-12345)"
			},
			"geometry": {
				"type": "Point",
				"coordinates": [e.latlng.lng, e.latlng.lat]
			}
		});
		
		map.removeLayer(indoorLayer);
		indoorLayer = new L.Indoor(geojsonFeature, {
			onEachFeature: onEachFeature,
			pointToLayer: function (feature, latlng) {
				return L.marker(latlng, {icon: geojsonMarkerOptions});
			},
			filter: function(feature, layer) {
				if(feature.properties.office == office){
					return true;
				}
				else{
					return false;
				}
			}
		});

		indoorLayer.setLevel(level);
		indoorLayer.addTo(map);
/*
		levelControl.removeEventListener("levelchange");
		levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);
		levelControl.addEventListener("levelchange", changeMap);
	*/
		/*
		map.removeLayer(markerLayer);
		markerLayer = L.geoJson(geojsonFeature, {
			onEachFeature: onEachFeature,
			pointToLayer: function (feature, latlng) {
				return L.marker(latlng, {icon: geojsonMarkerOptions});
			}
		}).addTo(map);*/
	}
}
map.on('click', onMapClick);


