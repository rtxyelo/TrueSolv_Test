@IsTest
private class ItemServiceTest {

	@TestSetup
	static void setupData() {
		List<Item__c> items = new List<Item__c>{
				new Item__c(
						Name = 'Apple',
						Description__c = 'Red apple',
						Family__c = 'Food',
						Type__c = 'Fruit',
						Price__c = 5
				),
				new Item__c(
						Name = 'Orange',
						Description__c = 'Orange fruit',
						Family__c = 'Food',
						Type__c = 'Fruit',
						Price__c = 6
				),
				new Item__c(
						Name = 'Laptop',
						Description__c = 'Business laptop',
						Family__c = 'Electronics',
						Type__c = 'Device',
						Price__c = 1200
				)
				};
		insert items;
	}

	@IsTest
	static void testGetAllItems() {
		Test.startTest();
		List<Item__c> result = ItemService.getItems(null, null, null);
		Test.stopTest();

		System.assertEquals(3, result.size());
	}

	@IsTest
	static void testFilterByFamily() {
		List<Item__c> result = ItemService.getItems('Food', null, null);
		System.assertEquals(2, result.size());
	}

	@IsTest
	static void testFilterByType() {
		List<Item__c> result = ItemService.getItems(null, 'Device', null);
		System.assertEquals(1, result.size());
	}

	@IsTest
	static void testSearch() {
		List<Item__c> result = ItemService.getItems(null, null, 'apple');
		System.assertEquals(1, result.size());
		System.assertEquals('Apple', result[0].Name);
	}
}
