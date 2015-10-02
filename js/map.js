
// meta
var isEdit = false;
var office = 1;
var level = 1;

// Create the map
var map = new L.Map('map', {
	center: new L.LatLng(49.41923, 8.6783),
	zoom: 19,
	minZoom:18,
	maxZoom: 22
});

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

var geojsonFeatures;  // a place to store our json loaded from server
var levelControl;	// our level control to switch floors for office 1

// customize look and feel of the markers on map
var geojsonMarkerOptions = L.divIcon({
				className: 'map-marker',
				iconSize: [16, 16],
				iconAnchor: [8, 16],
				popupAnchor: [0, -18],
				html: ''
			});
			
var office1Layer;
var office2Layer;

function createIndoorLayer(geojsonFeatures, geojsonMarkerOptions, officeFilter){
	return new L.Indoor(geojsonFeatures, {
				onEachFeature: onEachFeature,
				pointToLayer: function (feature, latlng) {
						return L.marker(latlng, {icon: geojsonMarkerOptions});
				},
				filter: function(feature, layer) {
					if(feature.properties.office == officeFilter){
						return true;
					}
					else{
						return false;
					}
				}
			});
}

// add event listeners and popups for each feature in geojsonFeatures
function onEachFeature(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties && feature.properties.popupContent) {
		layer.bindPopup(feature.properties.popupContent);
		
		var name = feature.properties.name;
		var office;
			if(feature.properties.office==1){
				office =  'Conshohocken';
			}
			else if(feature.properties.office==2){
				office = 'San Diego';
			}
		var location = feature.properties.location;
		var email = feature.properties.email;
		var phone = feature.properties.phone;
		
		var userTable ='' +
				'<table class="table">' +
				  '<tr>' +
					'<th>Name</th>' +
					'<th>Office</th> ' +
					'<th>Physical Location</th>' +
					'<th>Email</th>' +
					'<th>Phone</th>' +
				  '</tr>' +
				  '<tr>' +
					'<td>' + name + '</td>' +
					'<td>' + office + '</td> ' +
					'<td>' + location + '</td>' +
					'<td>' + email + '</td>' +
					'<td>' + phone + '</td>' +
				  '</tr>' +
				'</table>';
		
		//feature.properties.popupContent = "<strong>Location: " + location + "</strong><br>" + name + "(id-" + feature.properties.id + ")";
		
		// if clicked open popup but also set a flag so mouseout doesn't close popup
		layer.on('click', function(e){
			this.clicked = true;
			this.openPopup();
			document.getElementById('userInfo').innerHTML = userTable;
		});
		
		// unset clicked flag so mouseout works properly after a click event
		layer.on('popupclose', function(e){
			this.clicked = false;
			document.getElementById('userInfo').innerHTML = '';
		});
		
		layer.on('mouseover', function(e){
			this.openPopup();
			document.getElementById('userInfo').innerHTML = userTable;
		});
		
		layer.on('mouseout', function(e){
			if(!this.clicked){
				this.closePopup();
				document.getElementById('userInfo').innerHTML = '';
			}
		});
		
		layer.on('contextmenu', function(e){
			//alert("Delete?");
		});
	}
}

function loadData(){
var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			geojsonFeatures = JSON.parse(xhttp.responseText);
			
			office1Layer = createIndoorLayer(geojsonFeatures, geojsonMarkerOptions, 1);
			office1Layer.setLevel("1");
			office1Layer.addTo(map);
			office2Layer = createIndoorLayer(geojsonFeatures, geojsonMarkerOptions, 2);

			try{
				map.removeControl(levelControl);
			}
			catch(e){
				// nothing to remove
			}
			
			levelControl = new L.Control.Level({
				level: "1",
				levels: office1Layer.getLevels()
			});

			levelControl.addEventListener("levelchange", office1Layer.setLevel, office1Layer);
			levelControl.addEventListener("levelchange", changeMapImage);
			
			levelControl.addTo(map);
		}
	}
	xhttp.open("GET", "js/data.json", true);
	xhttp.send();
}

loadData();

// used with levelControl to focus the current map image
function changeMapImage(e){
	isEdit = false;	// work-around to prevent click-through floor buttons to map
	if(office == 1){
		office1Layer.setLevel(e.newLevel);
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
				level = 1;
				break;
		}
	}
	return false;
}


// --Event listeners-----------------------------//

document.getElementById('office1').addEventListener('click', function(){
	document.getElementById('office1').classList.add("active");
	document.getElementById('office2').classList.remove("active");
	
	office = 1;
	office1Level1.bringToFront();
	
	map.removeLayer(office2Layer);
	office1Layer.setLevel("1");
	office1Layer.addTo(map);
	
	levelControl.setLevel(1);
	levelControl.addTo(map);
	
}, false);

document.getElementById('office2').addEventListener('click', function(){
	document.getElementById('office2').classList.add("active");
	document.getElementById('office1').classList.remove("active");
	
	office = 2;
	office2Level1.bringToFront();
	
	map.removeLayer(office1Layer);
	office2Layer.setLevel("1");
	office2Layer.addTo(map);
			
	levelControl.removeFrom(map);
	
}, false);
	
	
	
// ---------Editing tools-------------------------------//
	
// register a listener on the save json button to fire off the server script and save to file
document.getElementById('btnSaveJson').addEventListener('click', function() {
	var encoded = JSON.stringify(geojsonFeatures);
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
	if(isEdit){
		geojsonFeatures.features.push({
			"type": "Feature",
			"properties": {
				"office": office,
				"level": level,
				"location": "44A",
				"name": "Alice Bob",
				"email": "abob@someplace.net",
				"phone": "302-555-5555",
				"popupContent": "<strong>Port 44A</strong><br>" + this.properties.name + " (id-12345)"
			},
			"geometry": {
				"type": "Point",
				"coordinates": [e.latlng.lng, e.latlng.lat]
			}
		});
		
		if(office == 1){
			map.removeLayer(office1Layer);
			office1Layer = createIndoorLayer(geojsonFeatures, geojsonMarkerOptions, office);

			office1Layer.setLevel(level);
			office1Layer.addTo(map);
		}
		else if(office == 2){
			map.removeLayer(office2Layer);
			office2Layer = createIndoorLayer(geojsonFeatures, geojsonMarkerOptions, office);

			office2Layer.setLevel(level);
			office2Layer.addTo(map);
		}
	}
}
map.on('click', onMapClick);


