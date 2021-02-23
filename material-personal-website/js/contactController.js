sujay.controller('contact', [
		'$scope',
		'$http',
		'$location',
		'$log',
		function ($scope, $http, $location, $log) {
            $scope.senderAddress = '';
            $scope.subject = '';
            $scope.emailBody = '';

}]);
