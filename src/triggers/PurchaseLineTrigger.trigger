trigger PurchaseLineTrigger on PurchaseLine__c (
		after insert, after update, after delete, after undelete
) {
	Set<Id> purchaseIds = new Set<Id>();

	if (Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete) {
		for (PurchaseLine__c pl : Trigger.new) {
			if (pl.PurchaseId__c != null) {
				purchaseIds.add(pl.PurchaseId__c);
			}
		}
	}

	if (Trigger.isDelete) {
		for (PurchaseLine__c pl : Trigger.old) {
			if (pl.PurchaseId__c != null) {
				purchaseIds.add(pl.PurchaseId__c);
			}
		}
	}

	if (purchaseIds.isEmpty()) return;

	List<PurchaseLine__c> lines = [
			SELECT PurchaseId__c, Amount__c, UnitCost__c
			FROM PurchaseLine__c
			WHERE PurchaseId__c IN :purchaseIds
	];

	Map<Id, Decimal> totalItemsByPurchase = new Map<Id, Decimal>();
	Map<Id, Decimal> grandTotalByPurchase = new Map<Id, Decimal>();

	for (PurchaseLine__c line : lines) {
		Id pid = line.PurchaseId__c;

		totalItemsByPurchase.put(
				pid, (totalItemsByPurchase.get(pid) == null ? 0 : totalItemsByPurchase.get(pid)) + line.Amount__c
		);

		grandTotalByPurchase.put(
				pid, (grandTotalByPurchase.get(pid) == null ? 0 : grandTotalByPurchase.get(pid)) + (line.Amount__c * line.UnitCost__c)
		);
	}

	List<Purchase__c> updates = new List<Purchase__c>();

	for (Id pid : purchaseIds) {
		updates.add(new Purchase__c(
				Id = pid,
				TotalItems__c = totalItemsByPurchase.get(pid),
				GrandTotal__c = grandTotalByPurchase.get(pid)
		));
	}

	if (!updates.isEmpty()) {
		update updates;
	}
}
