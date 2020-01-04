sujay.controller('projects', [
		'$scope',
		'$http',
		'$location',
		'$log',
        '$window',
        '$anchorScroll',
        '$timeout',
		function ($scope, $http, $location, $log, $window, $anchorScroll, $timeout) {
        $scope.$location = $location;
        $scope.$watch(function () {
            return $location.hash()
        }, function (value) {
            $anchorScroll();
        });

        $scope.link = function (url) {
            $window.location.href = url;
        };




}]);
