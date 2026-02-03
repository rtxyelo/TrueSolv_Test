@IsTest
private class PurchaseLineTriggerTest {

	@TestSetup
	static void setupData() {
		// Создаем аккаунт-клиента
		Account acct = new Account(Name='Test Account');
		insert acct;

		// Создаем пустой заказ Purchase__c для клиента
		Purchase__c purchase = new Purchase__c(
				Name = 'Test Purchase',
				ClientId__c = acct.Id,
				TotalItems__c = 0,
				GrandTotal__c = 0
		);
		insert purchase;
	}

	@IsTest
	static void testSinglePurchaseLine() {
		Purchase__c purchase = [SELECT Id, TotalItems__c, GrandTotal__c FROM Purchase__c LIMIT 1];

		PurchaseLine__c line = new PurchaseLine__c(
				PurchaseId__c = purchase.Id,
				Amount__c = 3,
				UnitCost__c = 50
		);
		insert line;

		purchase = [SELECT TotalItems__c, GrandTotal__c FROM Purchase__c WHERE Id = :purchase.Id];

		System.assertEquals(3, purchase.TotalItems__c, 'TotalItems__c должно быть 3');
		System.assertEquals(150, purchase.GrandTotal__c, 'GrandTotal__c должно быть 150');
	}

	@IsTest
	static void testMultiplePurchaseLines() {
		// Получаем созданный Purchase
		Purchase__c purchase = [SELECT Id, TotalItems__c, GrandTotal__c FROM Purchase__c LIMIT 1];

		// Создаем несколько строк заказа за один DML (bulk)
		List<PurchaseLine__c> lines = new List<PurchaseLine__c>{
				new PurchaseLine__c(PurchaseId__c = purchase.Id, Amount__c = 2, UnitCost__c = 100),
				new PurchaseLine__c(PurchaseId__c = purchase.Id, Amount__c = 1, UnitCost__c = 200),
				new PurchaseLine__c(PurchaseId__c = purchase.Id, Amount__c = 3, UnitCost__c = 50)
				};
		insert lines; // триггер должен корректно обработать bulk insert

		// Перечитываем родителя
		purchase = [SELECT TotalItems__c, GrandTotal__c FROM Purchase__c WHERE Id = :purchase.Id];

		System.assertEquals(6, purchase.TotalItems__c, 'TotalItems__c должно быть 6');
		System.assertEquals(550, purchase.GrandTotal__c, 'GrandTotal__c должно быть 550');
	}

	@IsTest
	static void testMultiplePurchases() {
		// Создаем второй заказ
		Account acct = [SELECT Id FROM Account LIMIT 1];
		Purchase__c purchase2 = new Purchase__c(
				Name = 'Second Purchase',
				ClientId__c = acct.Id
		);
		insert purchase2;

		// Добавляем строки к разным заказам
		List<PurchaseLine__c> lines = new List<PurchaseLine__c>{
				new PurchaseLine__c(PurchaseId__c = purchase2.Id, Amount__c = 5, UnitCost__c = 10),
				new PurchaseLine__c(PurchaseId__c = purchase2.Id, Amount__c = 2, UnitCost__c = 50)
				};
		insert lines;

		// Проверяем totals для второго заказа
		purchase2 = [SELECT TotalItems__c, GrandTotal__c FROM Purchase__c WHERE Id = :purchase2.Id];
		System.assertEquals(7, purchase2.TotalItems__c, 'TotalItems__c должно быть 7');
		System.assertEquals(150, purchase2.GrandTotal__c, 'GrandTotal__c должно быть 150');
	}
}