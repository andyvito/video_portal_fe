(function(){
"use strict";

	var app = angular.module('videoPortal',['ui.router','ngCookies','angular-md5']);


	app.controller('LoginController', ['$scope','$rootScope','$location', '$cookies', 'loginService', 'md5', 
		function($scope,$rootScope, $location, $cookies, loginService, md5){

			$scope.submit = function(){				
				$scope.user.password = md5.createHash($scope.user.password || '');
				loginService.login($scope.user)
						.then(function(data){
					    		if (data.status && data.sessionId){
					    			$cookies.put('sessionId', data.sessionId);
					    			$rootScope.$apply(function(){
					    				$location.path('videos');	
					    			});		    	
					    		}
					    		else{
					    			//TODO: clean password and username from UI
									$location.path('login');
									console.log('no found');
									console.log(data);
					    		}
					    	});
			};

	}]);

	app.controller('VideosController', ['$scope', '$location', '$cookies', 'loginService', 
		function($scope,$location,$cookies,loginService){
		$scope.logout = function($scope){
			//$cookies.remove('sessionId');
			loginService.logout($scope)
					.then(function(data){
						console.log(data);
				        $location.path('/login');
					});
		};

	}]);


	app.config(['$stateProvider','$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	  $stateProvider.state('home', {
	      url: '/',
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
	  	  	function($location, $cookies){
	  	  		//$cookies.remove('sessionId')
	  	  		console.log($cookies.get('sessionId'));
	  	  		if (!$cookies.get('sessionId')){
	  	  			$location.path('login');
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


	app.factory('loginService', function($http, $location, $rootScope, $cookies, md5, ApiService){
		return{
		    login:function(user){				
				var data = {username: user.username,
							password: user.password};

		    	return new Promise(function(resolve){
		    		$http.post('/user/auth', data)
		    				.success(function(data, status, headers){
		    					user.username = "";
		    					user.password = "";
		    					resolve(data);
		    				})
		    				.error(function(data){
		    					alert('Error');
		    					console.log(data);
		    				});
    			});
		    },
		    logout:function($scope){				
		    	return new Promise(function(resolve){
		    		ApiService.logout($cookies.get('sessionId')).then(function(data){
		    			$cookies.remove('sessionId');
		    			$location.path('login');
		    		});
    			});
		    },
		    islogged:function(){
		    	return $cookies.get('sessionId') ? true : false;
		    }
		}
	});






  
})();