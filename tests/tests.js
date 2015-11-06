QUnit.module("Map Tests", {
	beforeEach: function(assert){
		this.fixture = $( "#qunit-fixture" );
		this.fixture.append("<div id='map'></div>");
		this.map = $.mapModule({exposedForTesting: true});
		this.map.init();
		assert.ok(this.map, "The map exists.");
		assert.ok(this.map.mapObject, "The leaflet map object exists.");
		assert.equal(this.map.currentOffice, -1, "The current office is not yet set.");
		assert.deepEqual(this.map.officeList, [], "The office list is empty at start-up.");
		assert.deepEqual(this.map.activeLayers, [], "Active layers list is empty at start-up");
		assert.deepEqual(this.map.levelControl, {}, "No level controls have been added yet.");
	}
});

QUnit.test("Testing map initialization.", function(assert){
	assert.expect(6);
});

QUnit.test('Adding offices.', function(assert){
	this.fixture.append('<ul class="dropdown-menu" id="officeList"></ul>');
	var officeDropdown = $('#officeList');
	
	// office 1
	this.map.addOffice(1, 'Conshohocken');
	assert.equal(this.map.officeList.length, 1, 'Office list has 1 element.');
	assert.deepEqual(this.map.officeList, [{'id': 1, 'name': 'Conshohocken', 'floorList': []}], 'Office 1 added.');
	assert.equal(officeDropdown.children().length, 1, 'Office dropdown contains 1 child.');
	assert.deepEqual(officeDropdown.children()[0].innerHTML, '<a href="#" id="office1">Conshohocken</a>', 'Dropdown contains office 1');
	
	// office 2
	this.map.addOffice(2, 'San Diego');
	assert.equal(this.map.officeList.length, 2, 'Office list has 2 elements.');
	assert.deepEqual(this.map.officeList, [
			{'id': 1, 'name': 'Conshohocken', 'floorList': []},
			{'id': 2, 'name': 'San Diego', 'floorList': []},
		], 'Office 2 added.');
	assert.equal(officeDropdown.children().length, 2, 'Office dropdown contains 2 children.');
	assert.deepEqual(officeDropdown.children()[0].innerHTML, '<a href="#" id="office1">Conshohocken</a>', 'Dropdown contains office 1');
	assert.deepEqual(officeDropdown.children()[1].innerHTML, '<a href="#" id="office2">San Diego</a>', 'Dropdown contains office 2');
});

/*

QUnit.test("template", function(assert){
	
});

*/