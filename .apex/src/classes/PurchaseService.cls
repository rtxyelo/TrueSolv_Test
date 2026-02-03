public with sharing class PurchaseService {

	@AuraEnabled
	public static Id checkout(Id accountId, String cartItemsJson){
		if (accountId == null) {
			throw new AuraHandledException('Account is required');
		}

		List<CartItemDTO> cartItems = (List<CartItemDTO>) JSON.deserialize(cartItemsJson, List<CartItemDTO>.class);

		if (cartItems == null || cartItems.isEmpty()) {
			throw new AuraHandledException('Cart is empty');
		}

		System.debug('===============================purchase.Id: ' + cartItems[0]);

		Purchase__c purchase = new Purchase__c(
				Name = 'Purchase ' + Datetime.now().format('yyyyMMdd-HHmmss'),
				ClientId__c = accountId);
		insert purchase;

		List<PurchaseLine__c> lines = new List<PurchaseLine__c>();

		for (CartItemDTO ci : cartItems) {
			lines.add(new PurchaseLine__c(
					PurchaseId__c = purchase.Id,
					ItemId__c = ci.itemId,
					Amount__c = ci.quantity,
					UnitCost__c = ci.price
			));
		}

		insert lines;

		System.debug('===============================purchase.Id: ' + purchase.Id);
		return purchase.Id;
	}

	public class CartItemDTO {
		@AuraEnabled public Id itemId;
		@AuraEnabled public Integer quantity;
		@AuraEnabled public Decimal price;
	}
}