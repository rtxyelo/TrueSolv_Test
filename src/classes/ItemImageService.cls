public with sharing class ItemImageService {

	@AuraEnabled
	public static String fetchImageUrl(String itemName) {
		try {
			String accessKey = 'LLHvQYuwxRVvzIjJH8V_dC5A66D19_sTpm_3fcdozVc';
			String endpoint = 'https://api.unsplash.com/search/photos?query=' + EncodingUtil.urlEncode(itemName, 'UTF-8');

			HttpRequest req = new HttpRequest();
			req.setEndpoint(endpoint);
			req.setMethod('GET');
			req.setHeader('Authorization', 'Client-ID ' + accessKey);

			Http http = new Http();
			HttpResponse res = http.send(req);

			if (res.getStatusCode() == 200) {
				// JSON парсим
				Map<String, Object> json = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
				List<Object> results = (List<Object>) json.get('results');
				if (!results.isEmpty()) {
					Map<String, Object> first = (Map<String, Object>) results[0];
					Map<String, Object> urls = (Map<String, Object>) first.get('urls');
					return (String) urls.get('small'); // можно small/regular/full
				}
			}
		} catch (Exception e) {
			System.debug('Unsplash error: ' + e);
		}
		return null; // если ничего не нашли или ошибка
	}
}
