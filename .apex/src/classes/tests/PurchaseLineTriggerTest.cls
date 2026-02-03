@IsTest
private class PurchaseLineTriggerTest {

	@TestSetup
	static void setupData() {
		Account acct = new Account(Name = 'Test Account');
		insert acct;

		Purchase__c purchase = new Purchase__c(
				Name = 'Test Purchase',
				ClientId__c = acct.Id,
				TotalItems__c = 0,
				GrandTotal__c = 0
		);
		insert purchase;
	}

	private static Item__c createItem() {
		Item__c item = new Item__c(
				Name = 'Test Item',
				Price__c = 100
		);
		insert item;
		return item;
	}

	@IsTest
	static void testSinglePurchaseLine() {
		Purchase__c purchase = [SELECT Id FROM Purchase__c LIMIT 1];
		Item__c item = createItem();

		PurchaseLine__c line = new PurchaseLine__c(
				PurchaseId__c = purchase.Id,
				ItemId__c = item.Id,
				Amount__c = 3,
				UnitCost__c = 50
		);
		insert line;

		purchase = [SELECT TotalItems__c, GrandTotal__c FROM Purchase__c WHERE Id = :purchase.Id];

		System.assertEquals(3, purchase.TotalItems__c);
		System.assertEquals(150, purchase.GrandTotal__c);
	}

	@IsTest
	static void testMultiplePurchaseLines() {
		Purchase__c purchase = [SELECT Id FROM Purchase__c LIMIT 1];
		Item__c item = createItem();

		List<PurchaseLine__c> lines = new List<PurchaseLine__c>{
				new PurchaseLine__c(PurchaseId__c = purchase.Id, ItemId__c = item.Id, Amount__c = 2, UnitCost__c = 100),
				new PurchaseLine__c(PurchaseId__c = purchase.Id, ItemId__c = item.Id, Amount__c = 1, UnitCost__c = 200),
				new PurchaseLine__c(PurchaseId__c = purchase.Id, ItemId__c = item.Id, Amount__c = 3, UnitCost__c = 50)
				};
		insert lines;

		purchase = [SELECT TotalItems__c, GrandTotal__c FROM Purchase__c WHERE Id = :purchase.Id];

		System.assertEquals(6, purchase.TotalItems__c);
		System.assertEquals(550, purchase.GrandTotal__c);
	}

	@IsTest
	static void testMultiplePurchases() {
		Account acct = [SELECT Id FROM Account LIMIT 1];
		Item__c item = createItem();

		Purchase__c purchase2 = new Purchase__c(
				Name = 'Second Purchase',
				ClientId__c = acct.Id
		);
		insert purchase2;

		List<PurchaseLine__c> lines = new List<PurchaseLine__c>{
				new PurchaseLine__c(PurchaseId__c = purchase2.Id, ItemId__c = item.Id, Amount__c = 5, UnitCost__c = 10),
				new PurchaseLine__c(PurchaseId__c = purchase2.Id, ItemId__c = item.Id, Amount__c = 2, UnitCost__c = 50)
				};
		insert lines;

		purchase2 = [SELECT TotalItems__c, GrandTotal__c FROM Purchase__c WHERE Id = :purchase2.Id];

		System.assertEquals(7, purchase2.TotalItems__c);
		System.assertEquals(150, purchase2.GrandTotal__c);
	}
}