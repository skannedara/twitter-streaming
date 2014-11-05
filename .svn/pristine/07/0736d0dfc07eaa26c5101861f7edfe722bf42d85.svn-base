/**
 * AngularJS module to process a posRuleApp form.
 */
angular.module('twitterDataApp', ['ajoslin.promise-tracker', 'ui.bootstrap', 'scrollable-table'])
  .controller('twitterDataControler', function ($scope, $http, $log, promiseTracker, $timeout) {
  	
	$scope.resultData = [];
	$scope.nextPageNum = 1;
	$scope.prePageNum = 0;
	$scope.showPrevious = false;
	// get the rules to display in page.  
	$scope.loadResults = $http.get('/api/twitterData/' + 0)
		.success(function(data){
			//console.log("siva data call "); 
		console.log(data); 
		$scope.resultData = data;
		//console.log($scope.resultData); 
	}).error(function(err){"ERR while load page data", console.log(err)});
    
	//Table Sorting
	$scope.sort = {
		column: '',
		descending: false
	};    
	$scope.changeSorting = function(column) {
		var sort = $scope.sort;
		if (sort.column == column) {
			sort.descending = !sort.descending;
		} else {
			sort.column = column;
			sort.descending = false;
		}
	};
	// Fetch next or previous data
	$scope.dataRefresh = function(pageType) {
		var nextPage = $scope.nextPageNum;
		var prePage = $scope.prePageNum;
		var pageNum = 0;
		if(pageType != null && pageType == 'Next'){
			pageNum = $scope.nextPageNum;
			$scope.nextPageNum = nextPage+1;
			$scope.prePageNum = nextPage-1;
		} else if(pageType != null && pageType == 'Prev'){
			pageNum = $scope.prePageNum;
			$scope.nextPageNum = prePage+1;
			$scope.prePageNum = prePage-1;
		}
		$http.get('/api/twitterData/' + pageNum)
			.success(function(data){
			console.log(data); 
			$scope.resultData = data;
			console.log("siva - "+ pageNum + " - " + $scope.nextPageNum + " - "+ $scope.prePageNum);
			if($scope.prePageNum>=0){
				$scope.showPrevious = true;
			} else {
				$scope.showPrevious = false;
			}


		}).error(function(err){"ERR while loading selected page data", console.log(err)});
	};
 
  });
