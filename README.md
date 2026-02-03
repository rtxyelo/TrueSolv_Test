## Manager Access Logic

Manager access (IsManager field of User object) is determined by the presence of system-level permissions  
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
```
---

## Admin access provided

An admin user has been created on the Salesforce Dev instance:
Email: dev@truesolv.com

Profile: System Administrator

---

## Unmanaged package URL

https://login.salesforce.com/packaging/installPackage.apexp?p0=04tg50000002Ei1
