@IsTest
private class ItemServiceTest {

	@TestSetup
	static void setupTestData() {
		List<Item__c> items = new List<Item__c>{
				new Item__c(Name='Red Shirt', Type__c='Clothing', Family__c='Standard', Price__c=50, Description__c='Cotton T-shirt'),
				new Item__c(Name='Blue Jeans', Type__c='Clothing', Family__c='Premium', Price__c=100, Description__c='Denim Pants'),
				new Item__c(Name='Smartphone', Type__c='Electronics', Family__c='Premium', Price__c=300, Description__c='Android phone'),
				new Item__c(Name='Laptop', Type__c='Electronics', Family__c='Deluxe', Price__c=1200, Description__c='Gaming laptop'),
				new Item__c(Name='Office Chair', Type__c='Furniture', Family__c='Standard', Price__c=150, Description__c='Ergonomic chair')
				};
		insert items;
	}

	@IsTest
	static void testGetItemsByFamily() {
		Test.startTest();
		List<Item__c> standardItems = ItemService.getItems('Standard', null, null);
		Test.stopTest();

		System.assertEquals(2, standardItems.size(), 'Должны вернуться 2 элемента с Family=Standard');
		for (Item__c item : standardItems) {
			System.assertEquals('Standard', item.Family__c);
		}
	}

	@IsTest
	static void testGetItemsByType() {
		Test.startTest();
		List<Item__c> electronicsItems = ItemService.getItems(null, 'Electronics', null);
		Test.stopTest();

		System.assertEquals(2, electronicsItems.size(), 'Должны вернуться 2 элемента с Type=Electronics');
		for (Item__c item : electronicsItems) {
			System.assertEquals('Electronics', item.Type__c);
		}
	}

	@IsTest
	static void testGetItemsBySearchKey() {
		Test.startTest();
		List<Item__c> searchResults = ItemService.getItems(null, null, 'Laptop');
		Test.stopTest();

		System.assertEquals(1, searchResults.size(), 'Должен вернуться 1 элемент по ключу "Laptop"');
		System.assertEquals('Laptop', searchResults[0].Name);
	}

	@IsTest
	static void testGetItemsByFamilyAndType() {
		Test.startTest();
		List<Item__c> items = ItemService.getItems('Premium', 'Clothing', null);
		Test.stopTest();

		System.assertEquals(1, items.size(), 'Должен вернуться 1 элемент Family=Premium и Type=Clothing');
		System.assertEquals('Blue Jeans', items[0].Name);
	}

	@IsTest
	static void testGetItemsByAllFilters() {
		Test.startTest();
		List<Item__c> items = ItemService.getItems('Premium', 'Electronics', 'Smartphone');
		Test.stopTest();

		System.assertEquals(1, items.size(), 'Должен вернуться 1 элемент с Family=Premium, Type=Electronics, searchKey=Smartphone');
		System.assertEquals('Smartphone', items[0].Name);
	}

	@IsTest
	static void testGetItemsNoFilter() {
		Test.startTest();
		List<Item__c> items = ItemService.getItems(null, null, null);
		Test.stopTest();

		System.assertEquals(5, items.size(), 'Должны вернуться все 5 элементов без фильтров');
	}

	@IsTest
	static void testGetFamilies() {
		Test.startTest();
		List<String> families = ItemService.getFamilies();
		Test.stopTest();

		System.assertEquals(3, families.size(), 'Должны вернуться все уникальные Family (Standard, Premium, Deluxe)');
		System.assert(families.contains('Standard'));
		System.assert(families.contains('Premium'));
		System.assert(families.contains('Deluxe'));
	}

	@IsTest
	static void testGetTypes() {
		Test.startTest();
		List<String> types = ItemService.getTypes();
		Test.stopTest();

		System.assertEquals(3, types.size(), 'Должны вернуться все уникальные Type (Clothing, Electronics, Furniture)');
		System.assert(types.contains('Clothing'));
		System.assert(types.contains('Electronics'));
		System.assert(types.contains('Furniture'));
	}
}
