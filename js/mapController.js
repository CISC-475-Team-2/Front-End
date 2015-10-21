(function($) {
	$.mapController = function(options){
		var cache;
		var controller = {
			options: $.extend({
			}, options),
			getData: function(success){
				$.ajax({
					url: 'js/data.json',
					dataType: 'json',
					success: success,
					error: function(request, status, error){
						console.log('error: ' + error);
					}
				})
				.done(function(data){
					cache = data;
				});
			},
			init: function(map){
				$.each(map.getOfficeList(), function(index, value){
					var id = '#office' + value.id;
					$('#office' + value.id).click(function(event){
						map.changeOfficeLayer(value.id);
						var text = $(this).text();
						$(this).parents('.dropdown').find('.dropdown-toggle').html(text + '<span class="caret"></span>');
					});
				});
				
				$('#search-form').submit(function(event){
					event.preventDefault();
					
					var searchString = $('#search-input').val().toLowerCase().trim();
					
					map.createSearchLayers(cache, searchString);
					map.refreshLayer();
					
					// blur then focus: this keeps the user in the control
					// but clears auto-complete pop-out when they submit
					$("#search-input").blur();
					$("#search-input").focus();
				});
			}
		}
		
		return{
			getData: controller.getData,
			init: controller.init
		}
	}
})(jQuery);