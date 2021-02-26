sujay.controller('navbar', [
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

        $scope.hoverValue = {
            resume: false,
            projects: false,
            profile: false,
            github: false,
            contact: false
        };




}]);
