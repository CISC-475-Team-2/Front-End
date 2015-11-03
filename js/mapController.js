(function($) {
	$.mapController = function(options){
		var cache;
		var controller = {
			options: $.extend({
			}, options),
			init: function(map){
				controller.getData('js/userData.json', function(userData){
					controller.getData('js/data.json', function(mapData){
						$.each(userData, function(switchKey, switchValue){
							$.each(switchValue.ports, function(portKey, portValue){
								 console.log('key: ' + switchKey + ' port ' + portKey);
								 $.each(mapData.features, function(index, feature){
									 if(feature.properties.switchName == switchKey && feature.properties.port == portKey){
										 feature.users.push(portValue);
									 }
								 });
								console.log(mapData);
							});
						});
						map.createLayers(mapData);
						map.changeOfficeLayer(1);
						cache = mapData;
						map.populateUserList();
					});
				});
				
				$.each(map.getOfficeList(), function(index, value){
					$('#office' + value.id).click(function(event){
						map.changeOfficeLayer(value.id);
						var text = $(this).text();
						$(this).parents('.dropdown').find('.dropdown-toggle').html(text + '<span class="caret"></span>');
						map.populateUserList();
					});
				});
				
				$('#search-form').submit(function(event){
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
				
				$('[data-toggle="toggle-user-panel"]').click(function() {
					var selector = $(this).data('target');
					var selector2 = $(this).data('target2');
					$(selector).toggleClass('collapsed');
					$(selector2).toggleClass('shift-right');
					if($(selector).hasClass('collapsed')){
						$(this).html('<span class="glyphicon glyphicon-triangle-right"></span>');
					}
					else{
						$(this).html('<span class="glyphicon glyphicon-triangle-left"></span>');
					}
				});
				
				map.getMap().on('move', function(event){
					map.getVisibleMarkers();
					map.populateUserList();
				});
			},
			getData: function(url, success){
				$.ajax({
					url: url,
					dataType: 'json',
					success: success,
					error: function(request, status, error){
						console.log('error in mapController.getData: ' + error);
					}
				});
			}
		}
		
		return{
			getData: controller.getData,
			init: controller.init
		}
	}
})(jQuery);