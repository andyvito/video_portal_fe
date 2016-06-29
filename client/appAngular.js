(function(){
	var app = angular.module('videoPortal',['ui.router']);




	app.controller('LoginController', function($scope,$location,$rootScope){

		$scope.submit = function(){
			var uname = $scope.username;
			var password = $scope.password;
			//Call the login service. If true,
				$rootScope.loggedIn = true;
				$location.path('videos');

		};
	});


	app.controller('VideosController', function($scope,$location){

		console.log('hola');
	});


	app.config(['$stateProvider','$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	  $stateProvider.state('home', {
	      url: '/login',
	      templateUrl: '/login.html',
	    })
	    .state('login', {
	      url: '/login',
	      templateUrl: '/login.html',
	      controller: 'LoginController'
	    })
	  	.state('videos', {
	  	  url: '/videos',
	  	  resolve:{
	  	  	function($location, $rootScope){
	  	  		console.log($rootScope.loggedIn);
	  	  		//TODO: check the user is logging
	  	  		if (!$rootScope.loggedIn){
	  	  			$location.path('login');
	  	  			console.log('entra');
	  	  		}
	  	  	},
	  	  },
          templateUrl: '/videos.html',
          controller: 'VideosController'
		})
		.state('video', {
		  url: '/video/{id}',
		  templateUrl: '/video.html',
		  controller: 'VideoController'
		})
		;

	  $urlRouterProvider.otherwise('home');
	}]);




  
})();