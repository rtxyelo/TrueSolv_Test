## Manager Access Logic

Manager access is determined by the presence of system-level permissions  
(**Modify All Data**).

Tests validate this logic using `System.runAs()` with a **System Administrator**
profile. This approach accurately reflects Salesforce’s security model and
avoids relying on hard-coded permission assignments.

---

### Implementation

```apex
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
