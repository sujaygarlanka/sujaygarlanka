sujay.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'navbar'
        })
        .when('/projects', {
            templateUrl: 'pages/projects.html',
            controller: 'projects'
        })
        .when('/contact', {
            templateUrl: 'pages/contact.html',
            controller: 'contact'
        })
        .when('/passwords', {
            templateUrl: 'pages/passwords.html',
            controller: 'passwords'
        })
});
