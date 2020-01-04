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
        .when('/about-me', {
            templateUrl: 'pages/about-me.html',
            controller: 'contact'
        });
});
