$('document').ready(function(){
	var map = $.mapModule();
	map.init();
	
	map.addOffice(1, 'Conshohocken');
	map.addFloor(1, 1, 'images/sample-map-f1.png');
	map.addFloor(1, 2, 'images/sample-map-f2.png');
	map.addFloor(1, 3, 'images/sample-map-f3.png');
	map.addFloor(1, 4, 'images/sample-map-f4.png');
	
	map.addOffice(2, 'San Diego');
	map.addFloor(2, 1, 'images/office2Level1.png');
	
	var controller = $.mapController();
	controller.init(map, 'data/userData.json', 'data/data.json');
});

