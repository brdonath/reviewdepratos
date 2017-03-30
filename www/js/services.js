angular.module('starter.services', []);

angular.module('firebase.utils', ["firebase"])
  .factory("ref", function ($constants) {
    return new Firebase($constants.appUrl);
  })
  .factory("geofire", function (ref) {
    return new GeoFire(ref.child("_geofire"));
  })
  .factory("Auth", function ($firebaseAuth, ref) {
    return $firebaseAuth(ref);
  })
  .factory("$pushService", function (ref,$localstorage) {

    var fn =  {
      saveRegToUser : function(){
        var registrationId = $localstorage.get("registrationId");
        var userId = $localstorage.get("userId");
        if(userId && registrationId) {
          ref.child("users/" + userId).update(
            {
              gcmRegistrationId: registrationId
            });
        }
      },
      register: function () {
        if (typeof PushNotification == "undefined") return;
        var push = PushNotification.init({
          android: {
            senderID: "697265010527",
            topics: ["all"]
          },
          ios: {
            alert: "true",
            badge: "true",
            sound: "true"
          },
          windows: {}
        });

        push.on('registration', function (data) {
          console.log(data);
          $localstorage.set("registrationId", data.registrationId);
          fn.saveRegToUser();
        });

        push.on('notification', function (data) {
          console.log(data);
          // data.message,
          // data.title,
          // data.count,
          // data.sound,
          // data.image,
          // data.additionalData
        });

        push.on('error', function (e) {
          console.log(e);
          // e.message
        });
      }
    }

    return fn;
  })
  .factory("$review", function (ref, geofire) {
    return {
      delete: function (review, callback) {
        ref.child("reviews").child(review.key).remove(function(err){
          if(err){
            console.log(err);
          }else{
            ref.child("users").child(review.userId).child("feed").child(review.key).remove();
            ref.child("places").child(review.place.place_id).child("feed").child(review.key).remove();
            ref.child("comments").child(review.key).remove();
            geofire.remove(review.key);
          }
        });
        callback();
      }
    }
  })
  .factory("$comment", ['ref', function (ref) {
    return {
      upload: function (review, currentAuth, newComment) {
        if (!newComment) return;
        var comment = {};
        comment.userName = currentAuth[currentAuth.provider].displayName;
        comment.userId = currentAuth.uid;
        comment.comment = newComment;
        comment.timestamp = new Date().getTime();
        var commentRef = ref.child("comments/").child(review.key).push();
        commentRef.setWithPriority(comment, -1 * comment.timestamp);
      },
      load: function (key, limit, callback) {
        var refChild = ref.child("comments/" + key).orderByPriority();
        if (limit) {
          refChild = refChild.limitToFirst(limit);
        }
        refChild.on("child_added", function (snap) {
          callback(
            {
              key: snap.key(),
              comment: snap.val()
            });
        });
      }
    }
  }]);

angular.module("places.utils", [])
  .factory('$placesService', function ($cordovaGeolocation) {
    var placesService = this;
    placesService.placeSelected;
    return {
      get: function (pageElement, placeId, callback) {
        var pService = new google.maps.places.PlacesService(pageElement);
        pService.getDetails({'placeId': placeId}, function (place, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(place);
            callback(place);
          } else {
            console.log(status);
          }
        });
      },
      nearbySearch: function (pageElement, callback) {
        var pService = new google.maps.places.PlacesService(pageElement);
        $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
          .then(function (position) {
            pService.nearbySearch({
              location: {lat: position.coords.latitude, lng: position.coords.longitude},
              rankBy: google.maps.places.RankBy.DISTANCE,
              types: ['restaurant']
            }, function (places, status, pagination) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                callback(places);
              }
            })
          }, function (err) {
            console.log(err);
          });
      },
      search: function (pageElement, query, callback, noResultsCallBack) {
        var pService = new google.maps.places.PlacesService(pageElement);
        $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
          .then(function (position) {
            pService.textSearch({
              query: query,
              location: {lat: position.coords.latitude, lng: position.coords.longitude},
              radius: '25000',
              type: ['restaurant']
            }, function (places, status, pagination) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                callback(places);
              } else {
                noResultsCallBack();
              }
            })
          }, function (err) {
            console.log(err);
            noResultsCallBack();
          });
      },
      setPlace: function (place) {
        placesService.placeSelected = place;
      },
      getPlace: function () {
        return placesService.placeSelected;
      }
    }
  })
  .factory('$localstorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }]);
