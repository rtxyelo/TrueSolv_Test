public with sharing class CheckUserIsManagerController {

	@AuraEnabled
	public static Boolean hasManagerAccess() {
		return [
				SELECT COUNT()
				FROM PermissionSetAssignment
				WHERE AssigneeId = :UserInfo.getUserId()
				AND PermissionSet.PermissionsModifyAllData = true
		] > 0;
	}
}
