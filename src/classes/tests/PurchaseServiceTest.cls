@IsTest
public class PurchaseServiceTest {

	private static Account createAccount() {
		Account acc = new Account(Name = 'Test Account');
		insert acc;
		return acc;
	}

	private static Item__c createItem(Decimal price) {
		Item__c item = new Item__c(
				Name = 'Test Item',
				Price__c = price
		);
		insert item;
		return item;
	}

	@IsTest
	static void test_checkout_noAccountId() {
		Boolean exceptionThrown = false;

		Test.startTest();
		try {
			PurchaseService.checkout(null, '[]');
		} catch (AuraHandledException e) {
			exceptionThrown = true;
		}
		Test.stopTest();

		System.assert(
				exceptionThrown,
				'AuraHandledException should be thrown when AccountId is null'
		);
	}

	@IsTest
	static void test_checkout_emptyCart() {
		Account acc = createAccount();
		Boolean exceptionThrown = false;

		Test.startTest();
		try {
			PurchaseService.checkout(acc.Id, '[]');
		} catch (AuraHandledException e) {
			exceptionThrown = true;
		}
		Test.stopTest();

		System.assert(
				exceptionThrown,
				'AuraHandledException should be thrown for empty cart'
		);
	}

	@IsTest
	static void test_checkout_success() {

		Account acc = createAccount();
		Item__c item1 = createItem(100);
		Item__c item2 = createItem(50);

		List<PurchaseService.CartItemDTO> cart = new List<PurchaseService.CartItemDTO>();

		PurchaseService.CartItemDTO dto1 = new PurchaseService.CartItemDTO();
		dto1.itemId = item1.Id;
		dto1.quantity = 2;
		dto1.price = 100;
		cart.add(dto1);

		PurchaseService.CartItemDTO dto2 = new PurchaseService.CartItemDTO();
		dto2.itemId = item2.Id;
		dto2.quantity = 1;
		dto2.price = 50;
		cart.add(dto2);

		String cartJson = JSON.serialize(cart);

		Test.startTest();
		Id purchaseId = PurchaseService.checkout(acc.Id, cartJson);
		Test.stopTest();

		Purchase__c purchase = [
				SELECT Id, ClientId__c
				FROM Purchase__c
				WHERE Id = :purchaseId
		];

		System.assertEquals(acc.Id, purchase.ClientId__c);

		List<PurchaseLine__c> lines = [
				SELECT ItemId__c, Amount__c, UnitCost__c
				FROM PurchaseLine__c
				WHERE PurchaseId__c = :purchaseId
		];

		System.assertEquals(2, lines.size());

		Map<Id, PurchaseLine__c> linesByItem = new Map<Id, PurchaseLine__c>();
		for (PurchaseLine__c pl : lines) {
			linesByItem.put(pl.ItemId__c, pl);
		}

		System.assertEquals(2, linesByItem.get(item1.Id).Amount__c);
		System.assertEquals(100, linesByItem.get(item1.Id).UnitCost__c);

		System.assertEquals(1, linesByItem.get(item2.Id).Amount__c);
		System.assertEquals(50, linesByItem.get(item2.Id).UnitCost__c);
	}
}
