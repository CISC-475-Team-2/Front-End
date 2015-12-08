(function ($) {
    $.adminModule = function (options) {
        var globals = {
            map: {},
            mapObject: {},
            mapController: {}
        }

        var admin = {
            options: $.extend({
            }, options),
            init: function (map, controller) {
                globals.map = map;
                globals.mapObject = map.getMap();
                globals.mapObject.on('click', function (e) {
                    var test1 = e.originalEvent.srcElement.tagName == 'BUTTON';
                    var test2 = e.originalEvent.srcElement.type == 'Submit';
                    var test3 = e.originalEvent.target.tagName == 'BUTTON';
                    var test4 = e.originalEvent.target.type == 'Submit';
                    if (!test1 && !test2 && !test3 && !test4) {
                        newMarkerPrompt(e);
                    }
                    
                });
                globals.mapController = controller;
            }
        }

        var util = {
            alert: function (status, message) {
                return '<div class="alert alert-' + status + ' fade in">' +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                                '<span aria-hidden="true">&times;</span>' +
                            '</button>' +
                            message +
                        '</div>';
            }
        }

        var saveMarker = function (switchName, port, coordinates, successMessage, errorMessage, isEdit) {
            var portMappingDataCache = globals.mapController.getPortMappingDataCache();
            var newFeature = {
                "type": "Feature",
                "properties": {
                    "switchName": switchName,
                    "port": port,
                    "office": globals.map.getGlobals().currentOffice,
                    "level": globals.map.getGlobals().currentFloor,
                    "popupContent": "No Data"
                },
                "users": [],
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                }
            };

            var duplicate = false;
            $.each(portMappingDataCache.features, function (index, feature) {
                if (feature.properties.switchName == newFeature.properties.switchName && feature.properties.port == newFeature.properties.port) {
                    if (isEdit) {
                        portMappingDataCache.features[index] = newFeature;
                    }
                    else {
                        duplicate = true;
                    }
                }
            });

            if (!duplicate) {

                if (!isEdit) {
                    portMappingDataCache.features.push(newFeature);
                }
                var localPortCache = JSON.parse(JSON.stringify(portMappingDataCache));
                var userDataCache = globals.mapController.getUserDataCache();
                $.each(userDataCache, function (switchKey, switchValue) {
                    $.each(switchValue, function (portKey, portValue) {
                        $.each(localPortCache.features, function (index, feature) {
                            if (feature.properties.switchName == switchKey && feature.properties.port == portKey) {
                                feature.users.push(portValue);
                            }
                        });
                    });
                });

                var cache = localPortCache;
                globals.mapController.setCache(cache);
                globals.map.createLayers(cache);
                globals.map.refreshLayer();
                //$('#newMarkerModal').modal('hide');

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
                        var alert = util.alert("success", successMessage);
                        $('#notificationArea').append(alert);
                        window.setTimeout(function () { $(".alert").alert('close'); }, 2000);
                    },
                    error: function (response) {
                        console.log(response.status + " : " + response.statusText);
                        var alert = util.alert("danger", errorMessage);
                        $('#notificationArea').append(alert);
                        window.setTimeout(function () { $(".alert").alert('close'); }, 3000);
                    }
                });
            }
            else {
                var alert = util.alert("danger", "<strong>Failure!</strong> That switch port pair already exists.");
                $('#notificationArea').append(alert);
                window.setTimeout(function () { $(".alert").alert('close'); }, 3000);
            }
        };

        var newMarkerPrompt = function (e) {
            var modalHTML = '<!-- Modal -->' +
            '<div id="newMarkerModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newMarkerModalLabel">' +
                '<div class="modal-dialog" role="document">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            '<h4 class="modal-title" id="myModalLabel">Add A New Switch/Port Pair</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<form>' +
                                '<div class="form-group">' +
                                    '<label for="switchNameInput">Switch name</label>' +
                                    '<input type="text" class="form-control" id="switchNameInput" placeholder="e.g. emaswitch00">' +
                                '</div>' +
                                '<div class="form-group">' +
                                    '<label for="portNameInput">Port</label>' +
                                    '<input type="text" class="form-control" id="portNameInput" placeholder="e.g. A1">' +
                                '</div>' +
                            '</form>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                            '<button id="saveMarker" type="button" class="btn btn-primary">Save changes</button>' +
                        '</div>' +
                    ' + </div>' +
                ' +</div>' +
            ' +</div>'; // end modalHTML

            $('body').append(modalHTML);
            $('#newMarkerModal').on('hidden.bs.modal', function (e) {
                $('#newMarkerModal').remove();
            });
            $('#saveMarker').on('click', function (e2) {
                var switchName = $('#switchNameInput');
                var port = $('#portNameInput');
                if (!switchName.val() || !port.val()) {
                    // stub
                }
                else {
                    saveMarker(switchName.val(), port.val(), [e.latlng.lng, e.latlng.lat], "<strong>Success!</strong> The new marker was saved.", "<strong>Failure!</strong> The new marker was not saved.");
                    $('#newMarkerModal').modal('hide');
                }
            });
            $('#newMarkerModal').modal('show');
        }

        if (SEATINGCHARTGLOBALS.adminMode) {
            return {
                init: admin.init,
                saveMarker: saveMarker
            }
        }
        else {
            return {
                init: function (map, controller) { }
            }
        }
    }
})(jQuery);