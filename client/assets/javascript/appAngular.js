(function(){
"use strict";

	var app = angular.module('videoPortal',['ui.router','ngCookies','angular-md5']);


	app.controller('LoginController', ['$scope', '$state', '$rootScope','$location', '$cookies', 
		'loginService', 'md5', 
		function($scope,$state,$rootScope, $location, $cookies, loginService, md5){

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

			$scope.goToAllVideos = function(){
				$state.go('videos')
			};


	}]);

	app.controller('VideosController', ['$scope', '$rootScope', '$state', '$cookies', 'videosService', '$filter',
		function($scope, $rootScope, $state, $cookies, videosService, $filter){
			$rootScope.numToLoad = 0;
			$scope.showMore = true;

			videosService.allVideos($cookies.get('sessionId'),$rootScope.numToLoad,9).then(function(videos){
							$scope.videos = videos.data;
							$rootScope.numToLoad += 9;
						});

			$scope.goToVideo = function(currentVideo){
								$state.go('video',{id:currentVideo._id})
							};

			$scope.moreVideos = function(){
								videosService.allVideos($cookies.get('sessionId'),$rootScope.numToLoad,9).then(function(videos){
									$rootScope.numToLoad += 9;
									$scope.showMore = videos.data.length < 9 ? false : true;
									angular.forEach(videos.data, function(v){
									        $scope.videos.push(v);
									    });
								});
							};

	}]);


	app.controller('VideoController', ['$scope', '$state', '$location', '$cookies', '$stateParams', '$sce', '$filter',
		'videosService', 'ApiService', 

		function($scope, $state, $location, $cookies, $stateParams, $sce, $filter, videosService, ApiService){
			var videoId = $stateParams.id;
			
			$scope.ownRating = 1;


			videosService.getVideoById($cookies.get('sessionId'),videoId).then(function(video){
							$scope.video = {};
 							$scope.video = video.data;
 							$scope.overallRatings = $filter('calculateAverage')(video.data.ratings);
						});

			videosService.getRelatedVideos($cookies.get('sessionId')).then(function(videosRelated){
							$scope.videosRelated = {};
							$scope.videosRelated = videosRelated.data;

						});

		    $scope.changeVideo = function(currentVideo){
		    					$state.go('video',{id:currentVideo._id})
							};


		    $scope.rateFunction = function(rating) {
		      						videosService.insertVideoRating($cookies.get('sessionId'), videoId, rating).then(function(result){
 									$scope.overallRatings = $filter('calculateAverage')(result.data.ratings);
									
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

	  $urlRouterProvider.otherwise('/');
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
					  	},
			insertVideoRating: function(sessionId, videoId, rating){
						var deferred = $q.defer();

			    		ApiService.insertVideoRating(sessionId, videoId, rating)
			    					.then(function(data){
			    						deferred.resolve(data);
			    					});
			    			
					    return deferred.promise;
					  	},
			getRelatedVideos: function(sessionId){
					    var deferred = $q.defer();

					    //Pseudo random function to show some related videos
			    		ApiService.allVideos(sessionId, Math.random() * (10 - 1) + 1,3)
			    					.then(function(data){
			    						deferred.resolve(data);
			    					});
			    			
					    return deferred.promise;



					  	}
			}

	});


	//Directive Filter for Show Video
	app.filter("trustUrl", ['$sce', function ($sce) {
	        return function (recordingUrl) {
	            return $sce.trustAsResourceUrl(recordingUrl);
	        };
	    }
	  ]);

	app.filter('calculateAverage', function () {
	  return function (MyData) {
	    var sum = 0; 
	    for(var i = 0; i < MyData.length; i++){
	    	sum += parseInt(MyData[i], 10); 
	    };

	    var avg = sum/MyData.length;

	    return avg; 
	  };
	});



	app.directive('starRating', function() {
		return {
			restrict : 'A',
			template : '<ul class="rating">'
					 + '	<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
					 + '\u2605'
					 + '</li>'
					 + '</ul>',
			scope : {
				ratingValue : '=',
				max : '=',
				onRatingSelected : '&'
			},
			link : function(scope, elem, attrs) {
				var updateStars = function() {
					scope.stars = [];
					for ( var i = 0; i < scope.max; i++) {
						scope.stars.push({
							filled : i < scope.ratingValue
						});
					}
				};
				
				scope.toggle = function(index) {
					scope.ratingValue = index + 1;
					scope.onRatingSelected({
						rating : index + 1
					});
				};
				
				scope.$watch('ratingValue',
					function(oldVal, newVal) {
						if (newVal) {
							updateStars();
						}
					}
				);
			}
		};
	});






})();