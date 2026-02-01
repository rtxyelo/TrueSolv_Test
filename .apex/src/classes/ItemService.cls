public with sharing class ItemService {

	@AuraEnabled(cacheable=true)
	public static List<Item__c> getItems(
			String family,
			String type,
			String searchKey
			) {
		String searchPattern = '%' + searchKey + '%';

		String soql =
				'SELECT Id, Name, Description__c, Type__c, Family__c, Price__c, Image__c ' +
				'FROM Item__c ' +
				'WHERE 1 = 1';

		if (String.isNotBlank(family)) {
			soql += ' AND Family__c = :family';
		}

		if (String.isNotBlank(type)) {
			soql += ' AND Type__c = :type';
		}

		if (String.isNotBlank(searchKey)) {
			soql += ' AND (Name LIKE :searchPattern OR Description__c LIKE :searchPattern)';
		}

		soql += ' ORDER BY Name';

		return Database.query(soql);
	}

	@AuraEnabled(cacheable=true)
	public static List<String> getTypes() {
		Schema.DescribeFieldResult fieldResult = Item__c.Type__c.getDescribe();
		List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
		List<String> types = new List<String>();
		for (Schema.PicklistEntry pe : picklistValues) {
			types.add(pe.getValue());
		}
		return types;
	}

	@AuraEnabled(cacheable=true)
	public static List<String> getFamilies() {
		Schema.DescribeFieldResult fieldResult = Item__c.Family__c.getDescribe();
		List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
		List<String> families = new List<String>();
		for (Schema.PicklistEntry pe : picklistValues) {
			families.add(pe.getValue());
		}
		return families;
	}

}
