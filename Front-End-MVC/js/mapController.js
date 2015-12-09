(function ($) {
    $.mapController = function (options) {
        var cache;
        var userDataCache;
        var portMappingDataCache;
        var resetSearch = true;

        var defaultJson = { "type": "FeatureCollection", "features": [] };
        var defaultUserJson = {};
        var controller = {
            options: $.extend({
            }, options),
            init: function (map, userDataPath, mapDataPath) {
                controller.getData(userDataPath, 'json', function (userData) {
                    try{
                        userData = JSON.parse(userData);
                    }
                    catch (e) {
                        // try to parse it in case it is returned as text/plain
                        // If we end up here we got actual JSON, yay! Don't do anything.
                    }
                    if (!userData || $.isEmptyObject(userData) || userData == null || userData == "" || userData == undefined || userData.length == 0) {
                        userData = defaultUserJson;
                    }
                    userDataCache = userData;
                    controller.getData(mapDataPath, 'json', function (mapData) {
                        if (!mapData || $.isEmptyObject(mapData) || mapData == null || mapData == "" || mapData == undefined || mapData.length == 0) {
                            mapData = defaultJson;
                        }
                        portMappingDataCache = JSON.parse(JSON.stringify(mapData));
                        $.each(userData, function (switchKey, switchValue) {
                            $.each(switchValue, function (portKey, portValue) {
                                $.each(mapData.features, function (index, feature) {
                                    if (feature.properties.switchName == switchKey && feature.properties.port == portKey) {
                                        feature.users.push(portValue);
                                    }
                                });
                            });
                        });
                        //console.log(mapData);
                        map.createLayers(mapData);
                        map.changeOfficeLayer(1);
                        //portMappingDataCache = mapData;
                        cache = mapData;
                        map.populateUserList();
                    },
                    function (request, status, error) {
                        var mapData = defaultJson;
                        portMappingDataCache = JSON.parse(JSON.stringify(mapData));
                        $.each(userData, function (switchKey, switchValue) {
                            $.each(switchValue.ports, function (portKey, portValue) {
                                $.each(mapData.features, function (index, feature) {
                                    if (feature.properties.switchName == switchKey && feature.properties.port == portKey) {
                                        feature.users.push(portValue);
                                    }
                                });
                            });
                        });
                        //console.log(mapData);
                        map.createLayers(mapData);
                        map.changeOfficeLayer(1);
                        //portMappingDataCache = mapData;
                        cache = mapData;
                        map.populateUserList();
                    });
                },
                        function (request, status, error) {
                            var userData = defaultUserJson;
                            userDataCache = userData;
                            controller.getData(mapDataPath, 'json', function (mapData) {
                                if (!mapData || $.isEmptyObject(mapData) || mapData == null || mapData == "" || mapData == undefined || mapData.length == 0) {
                                    mapData = defaultJson;
                                }
                                portMappingDataCache = JSON.parse(JSON.stringify(mapData));
                                $.each(userData, function (switchKey, switchValue) {
                                    $.each(switchValue.ports, function (portKey, portValue) {
                                        $.each(mapData.features, function (index, feature) {
                                            if (feature.properties.switchName == switchKey && feature.properties.port == portKey) {
                                                feature.users.push(portValue);
                                            }
                                        });
                                    });
                                });
                                //console.log(mapData);
                                map.createLayers(mapData);
                                map.changeOfficeLayer(1);
                                //portMappingDataCache = mapData;
                                cache = mapData;
                                map.populateUserList();
                            },
                            function (request, status, error) {
                                var mapData = defaultJson;
                                portMappingDataCache = JSON.parse(JSON.stringify(mapData));
                                $.each(userData, function (switchKey, switchValue) {
                                    $.each(switchValue.ports, function (portKey, portValue) {
                                        $.each(mapData.features, function (index, feature) {
                                            if (feature.properties.switchName == switchKey && feature.properties.port == portKey) {
                                                feature.users.push(portValue);
                                            }
                                        });
                                    });
                                });
                                //console.log(mapData);
                                map.createLayers(mapData);
                                map.changeOfficeLayer(1);
                                //portMappingDataCache = mapData;
                                cache = mapData;
                                map.populateUserList();
                            });
                        });


                $.each(map.getOfficeList(), function (index, value) {
                    $('#office' + value.id).click(function (event) {
                        map.changeOfficeLayer(value.id);
                        var text = $(this).text();
                        $(this).parents('.dropdown').find('.dropdown-toggle').html(text + '<span class="caret"></span>');
                        map.populateUserList();
                    });
                });

                $('#search-input').on('input', function (event) {
                    if ($('#search-input').val() || resetSearch) {
                        $('#search-form').submit();
                        if (resetSearch) {
                            resetSearch = false;
                        }
                        else {
                            resetSearch = true;
                        }
                    }
                });

                $('#search-form').submit(function (event) {
                    event.preventDefault();

                    var searchString = $('#search-input').val().toLowerCase().trim();

                    map.createSearchLayers(cache, searchString);
                    map.refreshLayer();
                    map.populateUserList();

                    // blur then focus: this keeps the user in the control
                    // but clears auto-complete pop-out when they submit
                    $("#search-input").blur();
                    $("#search-input").focus();
                });

                $('[data-toggle="toggle-user-panel"]').click(function () {
                    var selector = $(this).data('target');
                    var selector2 = $(this).data('target2');
                    $(selector).toggleClass('collapsed');
                    $(selector2).toggleClass('collapsed');
                    if ($(selector).hasClass('collapsed')) {
                        $(this).html('<span class="glyphicon glyphicon-triangle-right"></span>');
                    }
                    else {
                        $(this).html('<span class="glyphicon glyphicon-triangle-left"></span>');
                    }
                });

                map.getMap().on('move', function (event) {
                    map.populateUserList();
                });
            },
            getData: function (url, type, success, error) {
                $.ajax({
                    cache: false,
                    url: url,
                    dataType: type,
                    success: success,
                    error: error || function (request, status, error) {
                        console.log('error in mapController.getData: ' + error);
                    }
                });
            },
            getPortMappingDataCache: function () {
                return portMappingDataCache;
            },
            setPortMappingDataCache: function (data) {
                portMappingDataCache = data;
            },
            getCache: function () {
                return cache;
            },
            setCache: function (data) {
                cache = data;
            },
            getUserDataCache: function () {
                return userDataCache;
            },
            setUserDataCache: function (data) {
                userDataCache = data;
            }
        }

        return {
            getData: controller.getData,
            init: controller.init,
            getPortMappingDataCache: controller.getPortMappingDataCache,
            setPortMappingDataCache: controller.setPortMappingDataCache,
            getCache: controller.getCache,
            setCache: controller.setCache,
            getUserDataCache: controller.getUserDataCache,
            setUserDataCache: controller.setUserDataCache
        }
    }
})(jQuery);