public with sharing class ItemPurchaseToolVFController {
	public Id accountId { get; set; }

	public ItemPurchaseToolVFController(ApexPages.StandardController std) {
		this.accountId = std.getId();
	}

	public Id getAccountId() {
		return accountId;
	}
}