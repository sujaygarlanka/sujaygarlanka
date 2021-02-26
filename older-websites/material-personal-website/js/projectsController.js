sujay.controller('projects', [
		'$scope',
		'$http',
		'$location',
		'$log',
        '$window',
		function ($scope, $http, $location, $log, $window) {
        $scope.$location = $location;

        $scope.link = function (url) {
            $window.location.href = url;
        };




}]);
