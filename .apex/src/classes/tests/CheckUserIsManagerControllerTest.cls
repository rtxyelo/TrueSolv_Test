@IsTest
public class CheckUserIsManagerControllerTest {

	@IsTest
	static void test_isManager_returnsFalse_forRegularUser() {

		Profile p = [
				SELECT Id
				FROM Profile
				WHERE Name = 'Standard User'
				LIMIT 1
		];

		User u = new User(
				Alias = 'tuser',
				Email = 'testuser@test.com',
				EmailEncodingKey = 'UTF-8',
				LastName = 'Test',
				LanguageLocaleKey = 'en_US',
				LocaleSidKey = 'en_US',
				TimeZoneSidKey = 'Europe/London',
				ProfileId = p.Id,
				Username = 'testuser' + System.currentTimeMillis() + '@test.com'
		);

		insert u;

		System.runAs(u) {
			Test.startTest();
			Boolean result = CheckUserIsManagerController.hasManagerAccess();
			Test.stopTest();

			System.assertEquals(
					false,
					result,
					'Regular user without admin permissions should not be a manager'
			);
		}
	}
}
