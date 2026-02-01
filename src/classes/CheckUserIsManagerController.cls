public with sharing class CheckUserIsManagerController {

	// Метод для обновления IsManager__c текущего пользователя
	@AuraEnabled
	public static Boolean updateIsManager() {
		Id currentUserId = UserInfo.getUserId();
		Boolean isAdmin = false;

		// Проверяем все Permission Set Assignment текущего пользователя
		for(PermissionSetAssignment psa : [
				SELECT PermissionSet.PermissionsModifyAllData
				FROM PermissionSetAssignment
				WHERE AssigneeId = :currentUserId
		]) {
			isAdmin |= psa.PermissionSet.PermissionsModifyAllData;
		}

		// Получаем текущего пользователя
		User currentUser = [SELECT Id, IsManager__c FROM User WHERE Id = :currentUserId LIMIT 1];

		// Обновляем поле IsManager__c, если отличается
		if(currentUser.IsManager__c != isAdmin) {
			currentUser.IsManager__c = isAdmin;
			update currentUser;
		}

		// Возвращаем результат для LWC
		return isAdmin;
	}
}
