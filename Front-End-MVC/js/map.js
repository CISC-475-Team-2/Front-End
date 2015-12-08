$('document').ready(function () {
    $.ajaxSetup({ cache: false });  // disable cache so when markers are added or removed we update
	var map = $.mapModule();
	map.init();
	
	map.addOffice(1, 'Conshohocken');
	var imageBounds = [[49.41873, 8.67689], [49.41973, 8.67959]];
	map.addFloor(1, 1, 'Content/Images/Map-Conshohocken-Floor-1.svg', imageBounds);
	map.addFloor(1, 2, 'Content/Images/Map-Conshohocken-Floor-2.svg', imageBounds);
	map.addFloor(1, 3, 'Content/Images/Map-Conshohocken-Floor-3.svg', imageBounds);
	map.addFloor(1, 4, 'Content/Images/Map-Conshohocken-Floor-4.svg', imageBounds);
	
	imageBounds = [[49.41873, 8.67689], [49.42073, 8.67824]];
	map.addOffice(2, 'San Diego');
	map.addFloor(2, 1, 'Content/Images/Map-San-Diego.svg', imageBounds);
	
	var controller = $.mapController();
	controller.init(map, 'http://localhost:53853/api/SeatingChart', 'Content/data/data.json');
	map.setController(controller);

	var admin = $.adminModule();
	admin.init(map, controller);
	map.setAdmin(admin);
});

