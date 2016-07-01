/**
 * Created by allan duarte
 */
 "use strict";
angular.module('videoPortal').
    factory('ApiService', function ($http, $q) {

        var makeAPICall = function(urlSuffix, method, data, params){
            var deferred = $q.defer();
            $http({
                method: method || 'GET',
                url: urlSuffix,
                data: data || {},
                timeout: 120000,
                params: params
            }).success(function(data){
                deferred.resolve(data);
            }).error(function (error_data, error_code){
                if(error_code === 400){
                    deferred.reject(error_data);
                }
                else{
                    deferred.reject('Unable to communicate with the web service');
                }
            });
            return deferred.promise;
        };

        return {
            logout: function(data){
                return makeAPICall('/user/logout', 'GET', {}, {sessionId: data}); 
            },
            allVideos: function(sessionId, skip, limit){
                return makeAPICall('/videos', 'GET', {}, {sessionId: sessionId, skip:skip, limit:limit}); 
            },

            getVideoById: function(sessionId, videoId){
                return makeAPICall('/video', 'GET', {}, {sessionId: sessionId, videoId: videoId});   
            },

            insertVideoRating: function(sessionId, videoId, rating){
                return makeAPICall('/video/ratings', 'POST', {videoId: videoId, rating: rating}, {sessionId: sessionId});
            },


            create_place: function(place){
                return makeAPICall('places', 'POST', place);
            },            
            get_locations: function(location, page){
                console.log(location);
                return makeAPICall('locations', 'GET', {}, {lat: location.lat, long: location.long, page: page});
            },
            create_session: function(code){
                return makeAPICall('sessions', 'POST', {code: code});
            }, 
            get_accounts: function(){
                return makeAPICall('accounts');
            }, 
            show_account: function(account){
                return makeAPICall('accounts/'+account.account);
            },
            get_places: function(){
                return makeAPICall('places');
            },
            get_actions: function(accountId, checkIn){
                return makeAPICall('check_ins/'+checkIn+'/actions');
            }, 
            set_action: function(accountId, checkIn, action){
                return makeAPICall('check_ins/'+checkIn+'/actions', 'POST', action);
            },            
            create_account: function(account){
                return makeAPICall('accounts', 'POST', account);
            },
            update_account: function(accountId, account){
                return makeAPICall('accounts/'+accountId, 'PUT', account);
            },             
            update_place: function(placeId, place){
                return makeAPICall('places/'+placeId, 'PUT', place);
            },            
            get_checkin: function(placeId, checkIn){
                return makeAPICall('places/'+placeId+'/check_ins/'+checkIn);
            },
            get_checkins: function(placeId){
                return makeAPICall('places/'+placeId+'/check_ins');
            }, 
            get_user: function(placeId, userId){
                return makeAPICall('places/'+placeId+'/users/'+userId);
            }, 
            get_users: function(placeId){
                return makeAPICall('places/'+placeId+'/users');
            }                         
        };
    })
;
