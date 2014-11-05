angular.module('ajoslin.twitterDataService', []);
angular.module('ajoslin.twitterDataService')
// super simple service
// each function returns a promise object 
.factory('posRules', ['$http', function($http) {
	return {
		get : function() {
			return $http.get('/api/twitterData');
		}
	}
}])