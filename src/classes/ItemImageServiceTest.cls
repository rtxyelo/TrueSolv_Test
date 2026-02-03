@IsTest
public class ItemImageServiceTest {

	private class UnsplashSuccessMock implements HttpCalloutMock {
		public HTTPResponse respond(HTTPRequest req) {
			HttpResponse res = new HttpResponse();
			res.setStatusCode(200);
			res.setHeader('Content-Type', 'application/json');
			res.setBody('{"results": [{"urls": {"small": "https://images.unsplash.com/photo-test"}}]}');
			return res;
		}
	}

	private class UnsplashEmptyResultMock implements HttpCalloutMock {
		public HTTPResponse respond(HTTPRequest req) {
			HttpResponse res = new HttpResponse();
			res.setStatusCode(200);
			res.setHeader('Content-Type', 'application/json');
			res.setBody('{ "results": [] }');
			return res;
		}
	}

	private class UnsplashErrorMock implements HttpCalloutMock {
		public HTTPResponse respond(HTTPRequest req) {
			HttpResponse res = new HttpResponse();
			res.setStatusCode(500);
			res.setBody('Internal Server Error');
			return res;
		}
	}


	@IsTest
	static void test_fetchImageUrl_success() {
		Test.setMock(HttpCalloutMock.class, new UnsplashSuccessMock());

		Test.startTest();
		String imageUrl = ItemImageService.fetchImageUrl('Laptop');
		Test.stopTest();

		System.assertNotEquals(null, imageUrl);
		System.assertEquals(
				'https://images.unsplash.com/photo-test',
				imageUrl
		);
	}

	@IsTest
	static void test_fetchImageUrl_noResults() {
		Test.setMock(HttpCalloutMock.class, new UnsplashEmptyResultMock());

		Test.startTest();
		String imageUrl = ItemImageService.fetchImageUrl('Unknown');
		Test.stopTest();

		System.assertEquals(null, imageUrl);
	}

	@IsTest
	static void test_fetchImageUrl_apiError() {
		Test.setMock(HttpCalloutMock.class, new UnsplashErrorMock());

		Test.startTest();
		String imageUrl = ItemImageService.fetchImageUrl('Error');
		Test.stopTest();

		System.assertEquals(null, imageUrl);
	}
}