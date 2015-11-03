(function($) {
	$.mapModule = function(options){
		var mapObject;
		
		var currentOffice;
		var currentFloor;
		var officeList = [];
		var activeLayers = [];
		var levelControl;
		
		var map = {
			options: $.extend({
				center: new L.LatLng(49.41923, 8.6783),
				zoom: 19,
				minZoom:18,
				maxZoom: 22,
				imageBounds: [[49.41873, 8.67689], [49.41973, 8.67959]],
				initialOffice: 1,
				initialFloor: 1,
			}, options),
			init: function(){
				mapObject = new L.Map('map', {
						center: map.options.center,
						zoom: map.options.zoom,
						minZoom: map.options.minZoom,
						maxZoom: map.options.maxZoom
				});
				
				currentOffice = map.options.initialOffice;
				currentFloor = map.options.initialFloor;
				
				layers.createLayers({type:"FeatureCollection", "features":[]});
			},
			getMap(){
				return mapObject;
			}
		};
		
		var buildings = {
			getOfficeList(){
				return officeList;
			},
			getOffice: function(officeNum){
				var results = $.grep(officeList, function(e){ return e.id === officeNum });
				if(results.length == 0){
					// office doesn't exist
					return undefined;
				}
				else if(results.length == 1){
					// exactly one match
					return results[0];
				}
				else{
					// more than one match
					throw 'The office with id: ' + officeNum + ' already exists.';
				}
			},
			getFloor: function(office, floorNum){
				var officeObject;
				if(typeof(office) === 'number'){
					officeObject = buildings.getOffice(office);
				}
				else{
					officeObject = office;
				}
				var floorList = $.grep(officeObject.floorList, function(e){ return e.floor === floorNum });
					if(floorList.length == 0){
						// floor does not exist yet
						return undefined;
					}
					else if(floorList.length == 1){
						// exactly one match
						return floorList[0];
					}
					else{
						// more than one match
						throw 'The floor with id: ' + floorNum + ' already exists.';
					}
			},
			addOffice: function(officeNum, officeName){
				if(buildings.getOffice(officeNum, officeName) === undefined){
					officeList.push({
						'id': officeNum,
						'name' : officeName,
						'floorList': []
					});
					$('#officeList').append('<li><a href="#" id="office' + officeNum + '">' + officeName + '</a></li>');
				}
				else{
					throw 'The office with id: ' + officeNum + ' already exists.';
				}
			},
			addFloor: function(officeNum, floorNum, imageURL){
				var office = buildings.getOffice(officeNum);
				if(office != undefined){
					var floor = buildings.getFloor(office, floorNum);
					if(floor === undefined){
						var overlay = L.imageOverlay(imageURL, map.options.imageBounds).addTo(mapObject);
						office.floorList.push({'floor': floorNum, 'url': imageURL, 'image': overlay, 'markers': []});
					}
					else{
						throw 'The floor with id: ' + floorNum + ' already exists.';
					}
				}
				else{
					throw 'The office with id: ' + officeNum + ' does not exist.';
				}
			},
		};
		
		var controls = {
			removeLevelControl: function(){
				if(levelControl != undefined){
					levelControl.removeFrom(mapObject);
				}
			},
			addLevelControl: function(officeNum, floorNum){
				if(floorNum === undefined){
					floorNum = 1;
				}
				controls.removeLevelControl();
				var office = buildings.getOffice(officeNum);
				levelControl = new L.Control.Level({
					level: '1',
					levels: controls.getLevels(officeNum)
				});
				levelControl.setLevel(floorNum);
				levelControl.addEventListener('levelchange', office.layer.setLevel, office.layer);
				levelControl.addEventListener('levelchange', function(e){buildings.getFloor(currentOffice, e.newLevel).image.bringToFront()});
				levelControl.addEventListener('levelchange', function(e){currentFloor = e.newLevel});
				levelControl.addEventListener('levelchange', function(e){util.populateUserList()});
				levelControl.addTo(mapObject);
			},
			getLevels(officeNum){
				var levels = [];
				$.each(buildings.getOffice(officeNum).floorList, function(index, value){levels.push(value.floor)});
				if(levels.length <= 1){
					return [];
				}
				return levels;
			},
		};
		
		var layers = {
			createLayers: function(data){
				$.each(officeList, function(index, office){
					$.each(office.floorList, function(index, floor){
						if(floor.markers){
							floor.markers = [];
						}
					});
					office.layer = new L.Indoor(data, {
						onEachFeature: util.onEachFeature,
						pointToLayer: util.pointToLayer,
						filter: function(feature, layer){
							if(feature.properties.office == office.id){
								return true;
							}
							else{
								return false;
							}
						}
					});
				});
			},
			createSearchLayers: function(data, searchString){
				$.each(officeList, function(index, office){
					$.each(office.floorList, function(index, floor){
						if(floor.markers){
							floor.markers = [];
						}
					});
					mapObject.removeLayer(office.layer);
					office.layer = new L.Indoor(data, {
						onEachFeature: util.onEachFeature,
						pointToLayer: util.pointToLayer,
						filter: function(feature, layer){
							if(feature.properties.office == office.id){
								var found = false;
								$.each(feature.users, function(index, user){
									var name = user.firstName + ' ' + user.lastName;
									if(name.toLowerCase().trim().indexOf(searchString) > -1){
										found = true;
										return;
									}
								});
								if(found){
									return true;
								}
							}
							return false;
						}
					});
				});
			},
			refreshLayer: function (){
				var layer = buildings.getOffice(currentOffice).layer;
				layers.clearLayers();
				layer.setLevel(currentFloor);
				layer.addTo(mapObject);
				activeLayers.push(layer);
				controls.addLevelControl(currentOffice, currentFloor);
			},
			clearLayers: function(){
				$.each(activeLayers, function(index, value){
					mapObject.removeLayer(value);
					activeLayers.pop(value);
				});
			},
			changeOfficeLayer: function(officeNum){
				var layer = buildings.getOffice(officeNum).layer;
				layers.clearLayers();
				layer.addTo(mapObject);
				activeLayers.push(layer);
				layer.setLevel(1);
				//buildings.changeFloor(officeNum, 1);
				buildings.getFloor(officeNum, 1).image.bringToFront();
				currentFloor = 1;
				controls.addLevelControl(officeNum);
				currentOffice = officeNum;
			},
		};
		
		var util = {
			geojsonMarkerOptions: L.divIcon({
				className: 'map-marker',
				iconSize: [16, 16],
				iconAnchor: [8, 16],
				popupAnchor: [0, -18],
				html: ''
			}),
			getVisibleMarkers(){
				var markers = buildings.getOffice(currentOffice).floorList[currentFloor - 1].markers;
				var bounds = mapObject.getBounds();
				console.log(markers);
				console.log(bounds);
				var results = [];
				$.each(markers, function(key, value){
					if(bounds.contains(value._latlng)){
						console.log(value.feature.users[0].firstName);
						results.push(value.feature);
					}
				});
				return results;
			},
			populateUserList(){
				var visibleUsers = util.getVisibleMarkers();
				$('#user-results').html('');
				$.each(visibleUsers, function(index, value){
					var name = value.users[0].firstName + ' ' + value.users[0].lastName;
					$('#user-results').append('' +
					'<div class="user-box">' +
						'<div class="user-picture">' +
							'<img src="images/default-user.png">' +
						'</div>' +
						'<div class="user-info">' +
							'<h3 class="user-info-title">' + name + ' (mgriner@udel.edu)</h3>' +
							'<div class="user-info-details">Marketing</div>' +
							'<div class="user-info-details">610-555-5555</div>' +
						'</div>' +
					'</div>');
				});
			},
			onEachFeature: function(feature, layer){
				if(feature.users.length > 0){
					$.each(feature.users, function(index, user){
						var name, office, email, location, phone;
						name = user.firstName + ' ' + user.lastName;
						if(feature.properties.office==1){
							office =  'Conshohocken';
						}
						else if(feature.properties.office==2){
							office = 'San Diego';
						}
						email = user.email;
						location = user.city;
						phone = user.department;
						
						feature.properties.popupContent = '<p><span class="glyphicon glyphicon-user"></span>' +
						'<strong>' + name + '</strong></p><p>' + email + '</p>';
						
						layer.bindPopup(feature.properties.popupContent);
						
						var userTable ='' +
							'<div class="table-responsive">' +
								'<table class="table table-condensed">' +
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
								'</table>' +
							'</div>';
					
					// if clicked open popup but also set a flag so mouseout doesn't close popup
					layer.on('click', function(e){
						this.clicked = true;
						this.openPopup();
						$('#userInfo').html(userTable);
					});
					
					// unset clicked flag so mouseout works properly after a click event
					layer.on('popupclose', function(e){
						this.clicked = false;
						$('#userInfo').html('');
					});
					
					layer.on('mouseover', function(e){
						this.openPopup();
						$('#userInfo').html(userTable);
					});
					
					layer.on('mouseout', function(e){
						if(!this.clicked){
							this.closePopup();
							$('#userInfo').html('');
						}
					});
					
					layer.on('contextmenu', function(e){
						//alert("Delete?");
					});
					});
				}
			},
			pointToLayer: function(feature, latlng){
				console.log(feature);
				console.log(latlng);
				var marker = L.marker(latlng, {icon: util.geojsonMarkerOptions});
				var office = buildings.getOffice(feature.properties.office);
				console.log(office);
				office.floorList[feature.properties.level - 1].markers.push(marker);
				return marker;
			}
		};
		
		return {
			init: map.init,
			addOffice: buildings.addOffice,
			addFloor: buildings.addFloor,
			getOfficeList: buildings.getOfficeList,
			createLayers: layers.createLayers,
			changeOfficeLayer: layers.changeOfficeLayer,
			refreshLayer: layers.refreshLayer,
			createSearchLayers: layers.createSearchLayers,
			getMap: map.getMap,
			getVisibleMarkers: util.getVisibleMarkers,
			populateUserList: util.populateUserList,
		};
	}
})(jQuery);