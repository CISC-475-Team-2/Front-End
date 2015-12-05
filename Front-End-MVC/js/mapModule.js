(function ($) {
    $.mapModule = function (options) {

        var globals = {
            mapObject: {},
            currentOffice: -1,
            currentFloor: -1,
            officeList: [],
            activeLayers: [],
            levelControl: {},
            mapController: {},
            admin: {}
        }

        var map = {
            options: $.extend({
                center: new L.LatLng(49.41923, 8.6783),
                zoom: 19,
                minZoom: 18,
                maxZoom: 22,
                //imageBounds: [[49.41873, 8.67689], [49.41973, 8.67959]],
                //imageBoudns2: [[49.41873, 8.67689], [49.41973, 8.68073]],
                initialOffice: 1,
                initialFloor: 1,
                exposedForTesting: false,
                adminMode: false
            }, options),
            init: function () {
                globals.mapObject = new L.Map('map', {
                    center: map.options.center,
                    zoom: map.options.zoom,
                    minZoom: map.options.minZoom,
                    maxZoom: map.options.maxZoom
                });

                globals.currentOffice = map.options.initialOffice;
                globals.currentFloor = map.options.initialFloor;

                layers.createLayers({ type: "FeatureCollection", "features": [] });
            },
            getMap: function () {
                return globals.mapObject;
            },
            setController: function (controller) {
                globals.mapController = controller;
            },
            setAdmin: function (admin) {
                globals.admin = admin;
            }
        };

        var buildings = {
            getOfficeList: function () {
                return globals.officeList;
            },
            getOffice: function (officeNum) {
                var results = $.grep(globals.officeList, function (e) { return e.id === officeNum });
                if (results.length == 0) {
                    // office doesn't exist
                    return undefined;
                }
                else if (results.length == 1) {
                    // exactly one match
                    return results[0];
                }
                else {
                    // more than one match
                    throw 'The office with id: ' + officeNum + ' already exists.';
                }
            },
            getFloor: function (office, floorNum) {
                var officeObject;
                if (typeof (office) === 'number') {
                    officeObject = buildings.getOffice(office);
                }
                else {
                    officeObject = office;
                }
                var floorList = $.grep(officeObject.floorList, function (e) { return e.floor === floorNum });
                if (floorList.length == 0) {
                    // floor does not exist yet
                    return undefined;
                }
                else if (floorList.length == 1) {
                    // exactly one match
                    return floorList[0];
                }
                else {
                    // more than one match
                    throw 'The floor with id: ' + floorNum + ' already exists.';
                }
            },
            addOffice: function (officeNum, officeName) {
                if (buildings.getOffice(officeNum, officeName) === undefined) {
                    globals.officeList.push({
                        'id': officeNum,
                        'name': officeName,
                        'floorList': []
                    });
                    $('#officeList').append('<li><a href="#" id="office' + officeNum + '">' + officeName + '</a></li>');
                }
                else {
                    throw 'The office with id: ' + officeNum + ' already exists.';
                }
            },
            addFloor: function (officeNum, floorNum, imageURL, imageBounds) {
                var office = buildings.getOffice(officeNum);
                if (office != undefined) {
                    var floor = buildings.getFloor(office, floorNum);
                    if (floor === undefined) {
                        var overlay = L.imageOverlay(imageURL, imageBounds, { opacity: 0 }).addTo(globals.mapObject);
                        office.floorList.push({ 'floor': floorNum, 'url': imageURL, 'image': overlay, 'markers': [] });
                    }
                    else {
                        throw 'The floor with id: ' + floorNum + ' already exists.';
                    }
                }
                else {
                    throw 'The office with id: ' + officeNum + ' does not exist.';
                }
            },
        };

        var controls = {
            removeLevelControl: function () {
                if (globals.levelControl != undefined && !$.isEmptyObject(globals.levelControl)) {
                    globals.levelControl.removeFrom(globals.mapObject);
                }
            },
            addLevelControl: function (officeNum, floorNum) {
                if (floorNum === undefined) {
                    floorNum = 1;
                }
                controls.removeLevelControl();
                var office = buildings.getOffice(officeNum);
                globals.levelControl = new L.Control.Level({
                    level: '1',
                    levels: controls.getLevels(officeNum)
                });
                globals.levelControl.setLevel(floorNum);
                globals.levelControl.addEventListener('levelchange', office.layer.setLevel, office.layer);
                globals.levelControl.addEventListener('levelchange', function (e) {
                    buildings.getFloor(globals.currentOffice, globals.currentFloor).image.setOpacity(0);
                    buildings.getFloor(globals.currentOffice, e.newLevel).image.bringToFront()
                    buildings.getFloor(globals.currentOffice, e.newLevel).image.setOpacity(1.0);
                });
                globals.levelControl.addEventListener('levelchange', function (e) { globals.currentFloor = e.newLevel });
                globals.levelControl.addEventListener('levelchange', function (e) { util.populateUserList() });
                globals.levelControl.addTo(globals.mapObject);
            },
            getLevels: function (officeNum) {
                var levels = [];
                $.each(buildings.getOffice(officeNum).floorList, function (index, value) { levels.push(value.floor) });
                if (levels.length <= 1) {
                    return [];
                }
                return levels;
            },
        };

        var layers = {
            createLayers: function (data) {
                $.each(globals.officeList, function (index, office) {
                    $.each(office.floorList, function (index, floor) {
                        if (floor.markers) {
                            floor.markers = [];
                        }
                    });
                    office.layer = new L.Indoor(data, {
                        onEachFeature: util.onEachFeature,
                        pointToLayer: util.pointToLayer,
                        filter: function (feature, layer) {
                            if (feature.properties.office == office.id) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                    });
                });
            },
            createSearchLayers: function (data, searchString) {
                $.each(globals.officeList, function (index, office) {
                    $.each(office.floorList, function (index, floor) {
                        if (floor.markers) {
                            floor.markers = [];
                        }
                    });
                    globals.mapObject.removeLayer(office.layer);
                    office.layer = new L.Indoor(data, {
                        onEachFeature: util.onEachFeature,
                        pointToLayer: util.pointToLayer,
                        filter: function (feature, layer) {
                            if (feature.properties.office == office.id) {
                                var found = false;
                                $.each(feature.users, function (index, user) {
                                    var name = user.firstName + ' ' + user.lastName;
                                    var dept = user.department;
                                    if (name.toLowerCase().trim().indexOf(searchString) > -1) {
                                        found = true;
                                        return;
                                    }
                                    //possible change, messes a bit with found
                                    if (dept.toLowerCase().trim().indexOf(searchString) > -1) {
                                        found = true;
                                        return;
                                    }

                                });
                                if (found) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    });
                });
            },
            refreshLayer: function () {
                var layer = buildings.getOffice(globals.currentOffice).layer;
                layers.clearLayers();
                layer.setLevel(globals.currentFloor);
                layer.addTo(globals.mapObject);
                globals.activeLayers.push(layer);
                controls.addLevelControl(globals.currentOffice, globals.currentFloor);
            },
            clearLayers: function () {
                $.each(globals.activeLayers, function (index, value) {
                    globals.mapObject.removeLayer(value);
                    globals.activeLayers.pop(value);
                });
            },
            changeOfficeLayer: function (officeNum) {
                var layer = buildings.getOffice(officeNum).layer;
                layers.clearLayers();
                layer.addTo(globals.mapObject);
                globals.activeLayers.push(layer);
                layer.setLevel(1);
                //buildings.changeFloor(officeNum, 1);
                buildings.getFloor(globals.currentOffice, globals.currentFloor).image.setOpacity(0);
                buildings.getFloor(officeNum, 1).image.bringToFront();
                buildings.getFloor(officeNum, 1).image.setOpacity(1.0);
                globals.currentFloor = 1;
                controls.addLevelControl(officeNum);
                globals.currentOffice = officeNum;
            },
        };

        var util = {
            geojsonMarkerOptions: L.divIcon({
                className: 'map-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 16],
                popupAnchor: [0, -35],
                html: ''
            }),
            getVisibleMarkers: function () {
                var markers = buildings.getOffice(globals.currentOffice).floorList[globals.currentFloor - 1].markers;
                var bounds = globals.mapObject.getBounds();
                var results = [];
                $.each(markers, function (key, value) {
                    if (bounds.contains(value._latlng)) {
                        results.push(value);
                    }
                });
                return results;
            },
            alert: function (status, message) {
                return '<div class="alert alert-' + status + ' fade in">' +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                                '<span aria-hidden="true">&times;</span>' +
                            '</button>' +
                            message +
                        '</div>';
            },
            populateUserList: function () {
                var visibleUsers = util.getVisibleMarkers();
                $('#user-results').html('');
                $.each(visibleUsers, function (index, value) {
                    var user = value.feature.users[0];
                    if (user) {
                        var name = user.firstName + ' ' + user.lastName,
				        id = user.id,
				        dept = user.department,
				        email = user.email,
				        phone = user.phone;

                        $('#user-results').append('' +
                        '<div id="user-' + id + '" class="user-container">' +
                            '<div class="user-box">' +
                                '<div class="user-picture">' +
                                    //'<img src = "http://whois/Default/Thumbnail?employeeId="' + id + '>' +  // replace below default with this when go live
                                    '<img src="Content/Images/default-user.png">' +
                                '</div>' +
                                '<div class="user-info">' +
                                    '<h3 class="user-info-title"><a href="http://whois/Default/Profile?employeeId=' + id + '">' + name + '</a>' +
                                        ' (<a href="mailto:' + email + '">' + email + '</a>)</h3>' +
                                    '<div class="user-info-details">' + dept + '</div>' +
                                    '<div class="user-info-details">' + phone + '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>');

                        if (value.feature.properties.clicked || value.feature.properties.hover) {
                            $('#user-' + id).css('background-color', '#333');
                            value.setIcon(new L.Icon.Default());
                        }

                        if (!value.feature.properties.clicked && !value.feature.properties.hover) {
                            $('#user-' + id).css('background-color', '#222');
                            value.setIcon(util.geojsonMarkerOptions);
                        }

                        $('#user-' + id).hover(
                            function (event) {
                                value.setIcon(new L.Icon.Default());
                                value.openPopup();
                                $('#user-' + id).css('background-color', '#333');
                            },
                            function (event) {
                                if (!value.feature.properties.clicked) {
                                    value.setIcon(util.geojsonMarkerOptions);
                                    value.closePopup();
                                    $('#user-' + id).css('background-color', '#222');
                                }
                            }
                        );

                        $('#user-' + id).click(function (event) {
                            if (!value.feature.properties.clicked) {
                                value.setIcon(new L.Icon.Default());
                                value.openPopup();
                                $('#user-' + id).css('background-color', '#333');
                                value.feature.properties.clicked = true;
                            }
                            else {
                                value.feature.properties.clicked = false;
                                value.setIcon(util.geojsonMarkerOptions);
                                value.closePopup();
                                $('#user-' + id).css('background-color', '#222');
                            }
                        });
                    }
                    // end if

                });
            },
            onEachFeature: function (feature, layer) {
                var userTable;
                if (feature.users.length > 0) {
                    $.each(feature.users, function (index, user) {
                        var name, department, office, email, location, phone;
                        name = user.firstName + ' ' + user.lastName;
                        if (feature.properties.office == 1) {
                            office = 'Conshohocken';
                        }
                        else if (feature.properties.office == 2) {
                            office = 'San Diego';
                        }
                        department = user.department;
                        email = user.email;
                        location = user.city;
                        phone = user.phone;
                        id = user.id;

                        feature.properties.popupContent = '' +
						'<div class="user-container">' +
							'<div class="user-box">' +
								'<div class="user-picture">' +
                                    //'<img src = "http://whois/Default/Thumbnail?employeeId="' + id + '>' +  // replace below default with this when go live
									'<img src="Content/Images/default-user.png">' +
								'</div>' +
								'<div class="user-info">' +
									'<h3 class="user-info-title"><a href="http://whois/Default/Profile?employeeId=' + id + '">' + name + '</a>' +
									    ' (<a href="mailto:' + email + '">' + email + '</a>)</h3>' +
									'<div class="user-info-details">' + department + '</div>' +
									'<div class="user-info-details">' + phone + '</div>' +
								'</div>' +
							'</div>' +
						'</div>';

                        userTable = '' +
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
                    });
                }
                else {
                    feature.properties.popupContent = '' +
						        '<div class="user-container">' +
							        '<div class="user-box">' +
								        '<div class="user-picture">' +
				    //'<img src = "http://whois/Default/Thumbnail?employeeId="' + id + '>' +  // replace below default with this when go live
									        '<img src="Content/Images/default-user.png">' +
								        '</div>' +
								        '<div class="user-info">' +
									        '<h3 class="user-info-title"><a href="#">No Data</a></h3>' +
									        '<div class="user-info-details"></div>' +
									        '<div class="user-info-details"></div>' +
								        '</div>' +
							        '</div>' +
						        '</div>';
                    userTable = '';
                }

                layer.bindPopup(feature.properties.popupContent);

                layer.on('contextmenu', function (e) {
                    if (SEATINGCHARTGLOBALS.adminMode) {
                        var removeModal = '' +
                            '<div id="removeUser-' + id + '" class="modal fade" tabindex="-1" role="dialog">' +
                              '<div class="modal-dialog">' +
                                '<div class="modal-content">' +
                                  '<div class="modal-header">' +
                                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                    '<h4 class="modal-title">Delete Marker</h4>' +
                                  '</div>' +
                                  '<div class="modal-body">' +
                                    '<p>This will permanently remove this marker.</p>' +
                                  '</div>' +
                                  '<div class="modal-footer">' +
                                    '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
                                    '<button id="removeUser-' + id + '-Button" type="button" class="btn btn-primary">Delete Marker</button>' +
                                  '</div>' +
                                '</div><!-- /.modal-content -->' +
                              '</div><!-- /.modal-dialog -->' +
                            '</div><!-- /.modal -->';

                        $('body').append(removeModal);
                        $('#removeUser-' + id).on('hidden.bs.modal', function (e) {
                            $('#removeUser-' + id).remove();
                        });

                        $('#removeUser-' + id + '-Button').on('click', function (e2) {
                            $('#removeUser-' + id).modal('hide');
                            var portMappingDataCache = globals.mapController.getPortMappingDataCache();
                            $.each(portMappingDataCache.features, function (portIndex, portFeature) {
                                if (portFeature) {
                                    var test1 = feature.properties.switchName == portFeature.properties.switchName;
                                    var test2 = feature.properties.port == portFeature.properties.port;
                                    if (test1 && test2) {
                                        portMappingDataCache.features.splice(portIndex, 1);
                                        var stringified = JSON.stringify({ data: JSON.stringify(portMappingDataCache) });

                                        $.ajax({
                                            cache: false,
                                            url: 'SaveMarker',
                                            type: 'POST',
                                            dataType: 'json',
                                            data: stringified,
                                            contentType: "application/json; charset=utf-8",
                                            success: function (response) {
                                                // yay
                                                var cache = globals.mapController.getCache();

                                                $.each(cache.features, function (cacheIndex, cacheFeature) {
                                                    if (cacheFeature) {
                                                        var test1 = feature.properties.switchName == cacheFeature.properties.switchName;
                                                        var test2 = feature.properties.port == cacheFeature.properties.port;
                                                        if (test1 && test2) {
                                                            cache.features.splice(cacheIndex, 1);
                                                        }
                                                    }
                                                });

                                                layers.createLayers(cache);
                                                layers.refreshLayer();
                                                util.populateUserList();
                                                var alert = util.alert("success", "<strong>Success!</strong> The marker has been removed.");
                                                $('#notificationArea').append(alert);
                                                window.setTimeout(function () { $(".alert").alert('close'); }, 2000);

                                            },
                                            error: function (response) {
                                                console.log(response.status + " : " + response.statusText);
                                                var alert = util.alert("danger", "<strong>Failure!</strong> The marker was not removed.");
                                                $('#notificationArea').append(alert);
                                                window.setTimeout(function () { $(".alert").alert('close'); }, 3000);
                                            }
                                        });
                                    }   //
                                }

                            });
                        });
                        $('#removeUser-' + id).modal('show');
                    }
                });

                layer.on('click', function (e) {
                    if (!this.feature.properties.dragging) {
                        if (this.feature.properties.clicked) {
                            this.feature.properties.clicked = false;
                            this.closePopup();
                        }
                        else {
                            this.feature.properties.clicked = true;
                            this.openPopup();
                        }
                        util.populateUserList();
                        $('#userInfo').html(userTable);
                    }
                });


                layer.on('popupclose', function (e) {
                    if (!this.feature.properties.dragging) {
                        $('#userInfo').html('');
                        //this.feature.properties.clicked = false;
                        this.feature.properties.hover = false;
                        //util.populateUserList();
                    }
                });

                layer.on('mouseover', function (e) {
                    if (!this.feature.properties.dragging) {
                        this.openPopup();
                        if (!this.feature.properties.clicked) {
                            this.feature.properties.hover = true;
                            util.populateUserList();
                        }
                        $('#userInfo').html(userTable);
                    }
                });

                layer.on('dragstart', function (e) {
                    this.closePopup();
                    this.feature.properties.hover = false;
                    this.feature.properties.clicked = false;
                    this.feature.properties.dragging = true;
                });

                layer.on('dragend', function (e) {
                    var latlng = e.target.getLatLng();
                    var coords = [latlng.lng, latlng.lat];
                    this.feature.geometry.coordinates = coords;
                    this.feature.properties.dragging = false;
                    util.populateUserList();
                    globals.admin.saveMarker(this.feature.properties.switchName, this.feature.properties.port, coords,
                        "<strong>Success!</strong> New marker position saved.", "<strong>Failure!</strong> New marker position was not saved.", true);
                });

                layer.on('mouseout', function (e) {
                    if (!this.feature.properties.dragging) {
                        if (this.feature.properties.hover) {
                            this.feature.properties.hover = false;
                            util.populateUserList();
                        }
                        if (!this.feature.properties.clicked) {
                            this.closePopup();
                        }
                    }
                });
            },
            pointToLayer: function (feature, latlng) {
                var isDraggable = false;
                if (SEATINGCHARTGLOBALS.adminMode) {
                    isDraggable = true;
                }
                var marker = L.marker(latlng, { icon: util.geojsonMarkerOptions, draggable: isDraggable });
                var office = buildings.getOffice(feature.properties.office);
                office.floorList[feature.properties.level - 1].markers.push(marker);
                return marker;
            },
            getGlobals: function () {
                return globals;
            }
        };

        if (!map.options.exposedForTesting) {
            return {
                init: map.init,
                setController: map.setController,
                setAdmin: map.setAdmin,
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
                getGlobals: util.getGlobals
            };
        }
        else if (map.options.exposedForTesting) {
            return {
                // globals
                mapObject: globals.mapObject,
                currentOffice: globals.currentOffice,
                currentFloor: globals.currentFloor,
                officeList: globals.officeList,
                activeLayers: globals.activeLayers,
                levelControl: globals.levelControl,

                // map
                options: map.options,
                init: map.init,
                getMap: map.getMap,

                // buildings
                getOfficeList: buildings.getOfficeList,
                getOffice: buildings.getOffice,
                getFloor: buildings.getFloor,
                addOffice: buildings.addOffice,
                addFloor: buildings.addFloor,

                // controls
                removeLevelControl: controls.removeLevelControl,
                addLevelControl: controls.addLevelControl,
                getLevels: controls.getLevels,

                // layers
                createLayers: layers.createLayers,
                createSearchLayers: layers.createSearchLayers,
                refreshLayer: layers.refreshLayer,
                clearLayers: layers.clearLayers,
                changeOfficeLayer: layers.changeOfficeLayer,

                // util
                geojsonMarkerOptions: util.geojsonMarkerOptions,
                getVisibleMarkers: util.getVisibleMarkers,
                populateUserList: util.populateUserList,
                onEachFeature: util.onEachFeature,
                pointToLayer: util.pointToLayer,

            };
        }
    }
})(jQuery);