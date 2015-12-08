$('document').ready(function () {
    L.Icon.Default.imagePath = '../libs/leaflet/images/';
    $.ajaxSetup({ cache: false });  // disable cache so when markers are added or removed we update
	var map = $.mapModule();
	map.init();
	
	map.addOffice(1, 'Conshohocken');
	var imageBounds = [[49.41873, 8.67689], [49.41973, 8.67959]];
	map.addFloor(1, 1, 'Content/Images/Map-Conshohocken-Floor-1.svg', imageBounds);
	map.addFloor(1, 2, 'Content/Images/Map-Conshohocken-Floor-2.svg', imageBounds);
	map.addFloor(1, 3, 'Content/Images/Map-Conshohocken-Floor-3.svg', imageBounds);
	map.addFloor(1, 4, 'Content/Images/Map-Conshohocken-Floor-4.svg', imageBounds);
	
	imageBounds = [[49.41822, 8.67758], [49.42043, 8.67955]];
	map.addOffice(2, 'San Diego');
	map.addFloor(2, 1, 'Content/Images/Map-San-Diego.svg', imageBounds);
	
	var controller = $.mapController();
	controller.init(map, 'Content/data/userData.json', 'Content/data/data.json');
	map.setController(controller);

	var admin = $.adminModule();
	admin.init(map, controller);
	map.setAdmin(admin);
});

