sujay.controller('passwords', [
		'$scope',
		'$http',
		'$location',
		'$log',
        '$window',
		function ($scope, $http, $location, $log, $window) {
        $scope.passwords = [];

        $http
            .get('/C_Worker/getPasswords')
            .then(
                function (success) {
                 $scope.passwords = success.data;

                },
                function (error) {
                    console.log(error);

                });


}]);
