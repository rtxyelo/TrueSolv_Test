public with sharing class ItemService {

	@AuraEnabled(cacheable=true)
	public static List<Item__c> getItems(String family, String type, String searchKey) {
		// Объявляем список для хранения условий
		List<String> conditions = new List<String>();

		if (String.isNotBlank(family)) {
			conditions.add('Family__c = :family');
		}

		if (String.isNotBlank(type)) {
			conditions.add('Type__c = :type');
		}

		if (String.isNotBlank(searchKey)) {
			conditions.add('(Name LIKE :searchPattern OR Description__c LIKE :searchPattern)');
		}

		String searchPattern = '%' + searchKey + '%';

		String soql = 'SELECT Id, Name, Description__c, Type__c, Family__c, Price__c, Image__c FROM Item__c';

		if (!conditions.isEmpty()) {
			soql += ' WHERE ' + String.join(conditions, ' AND ');
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
