$('document').ready(function(){
	var map = $.mapModule();
	map.init();
	
	map.addOffice(1, 'Conshohocken');
	var imageBounds = [[49.41873, 8.67689], [49.41973, 8.67959]];
	map.addFloor(1, 1, 'images/Map-Conshohocken-Floor-1.svg', imageBounds);
	map.addFloor(1, 2, 'images/Map-Conshohocken-Floor-2.svg', imageBounds);
	map.addFloor(1, 3, 'images/Map-Conshohocken-Floor-3.svg', imageBounds);
	map.addFloor(1, 4, 'images/Map-Conshohocken-Floor-4.svg', imageBounds);
	
	imageBounds = [[49.41873, 8.67689], [49.42073, 8.67824]];
	map.addOffice(2, 'San Diego');
	map.addFloor(2, 1, 'images/Map-San-Diego.svg', imageBounds);
	
	var controller = $.mapController();
	controller.init(map, 'data/userData.json', 'data/data.json');
});

