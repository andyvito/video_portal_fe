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
									$location.path('login');
					    		}
					    	});
			};

			$scope.logout = function(){
				loginService.logout()
						.then(function(data){
					        $location.path('login');
						});
			};


	}]);

	app.controller('VideosController', ['$scope', '$state', '$cookies', 'videosService', 
		function($scope,$state,$cookies,videosService){

			videosService.allVideos($cookies.get('sessionId'),0,9).then(function(videos){
							$scope.videos = videos.data;
							console.log(videos.data);
						});

			$scope.goToVideo = function(currentVideo){
								$state.go('video',{id:currentVideo._id})
							};
	}]);


	app.controller('VideoController', ['$scope', '$location', '$cookies', '$stateParams', '$sce',  'videosService', 'ApiService',
		function($scope, $location, $cookies, $stateParams, $sce,  videosService, ApiService){
			var videoId = $stateParams.id;
			videosService.getVideoById($cookies.get('sessionId'),videoId).then(function(video){
							$scope.video = {};
 							$scope.video.url = video.data.url;
						});


			/*videosService.getVideoById($cookies.get('sessionId'),videoId).then(function(video){
							$rootScope.video = {};
 							$rootScope.video.url = video.data.url;
						});*/


/*			$scope.video = {};
			ApiService.getVideoById($cookies.get('sessionId'),videoId).then(function(video){
 										$scope.video.url = video.data.url;
			    					});
*/


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
		    logout:function(){				
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



	app.factory('videosService', function($q, $cookies, ApiService){
		return{
		    allVideos: function(sessionId,skip,limit) {
					    var deferred = $q.defer();

			    		ApiService.allVideos(sessionId,skip,limit)
			    					.then(function(data){
			    						deferred.resolve(data);
			    					});
			    			
					    return deferred.promise;
					  },
			getVideoById: function(sessionId,videoId){
						var deferred = $q.defer();

			    		ApiService.getVideoById(sessionId,videoId)
			    					.then(function(data){
			    						deferred.resolve(data);
			    					});
			    			
					    return deferred.promise;

						/*ApiService.getVideoById(sessionId,videoId)
			    					.then(function(data){
			    						return data;
			    					});*/

					  }
			}
	});


	//Directive Filter for Show Video
	app.filter("trustUrl", ['$sce', function ($sce) {
	        return function (recordingUrl) {
	            return $sce.trustAsResourceUrl(recordingUrl);
	        };
	    }
	  ]
	);








})();