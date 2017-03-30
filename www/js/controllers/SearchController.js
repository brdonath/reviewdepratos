angular.module('starter.controllers')
  .controller("SearchCtrl", function ($scope, $state, ref, geofire, $cordovaGeolocation) {

    if (typeof analytics != "undefined") analytics.trackView('Search');

    $scope.autocompleteOptions = {
      componentRestrictions: {},
      types: ['establishment']
    };

    $scope.control = {};
    $scope.$on("$ionicView.beforeLeave", function () {
      if ($scope.control.clearPredictions) {
        $scope.control.clearPredictions();
      }
    });

    $scope.changed = function (place) {
      if (place && place.place_id) {
        if (typeof analytics != "undefined") analytics.trackEvent("Search", "place selected", place.name);
        $state.go("tab.searchestablishment", {establishmentId: place.place_id});
        $scope.place = null;
      }
    };

    $scope.radius = 10;
    var elemAdded = {};
    var geoQuery;


    $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
      .then(function (position) {

          var mapDiv = document.getElementById("searchmap");

          $scope.map = window.map.getMap(mapDiv);

          $scope.map.on(plugin.google.maps.event.MAP_READY, onMapInit);
          $scope.map.on(plugin.google.maps.event.CAMERA_CHANGE, onCameraChange);

          var location = {lat: position.coords.latitude, lng: position.coords.longitude}

          var latLng = new plugin.google.maps.LatLng(location.lat, location.lng);

          function onMapInit() {
            $scope.map.setCenter(latLng);
            $scope.map.setZoom(15);

            geoQuery = geofire.query({
              center: [location.lat, location.lng],
              radius: $scope.radius
            });

            var onKeyEnteredRegistration = geoQuery.on("key_entered", function (key, location, distance) {
              $scope.map.addMarker({
                'position': new plugin.google.maps.LatLng(location[0], location[1]),
                'styles': {
                  'font-weight': 'bold',
                  'color': '#5C8800'
                },
                'animation' : plugin.google.maps.Animation.DROP,
                'markerClick': function (marker) {
                  marker.getPosition(function (latLng) {
                    $scope.map.getZoom(function(zoom){
                      $scope.map.animateCamera({
                        'target': latLng,
                        'duration' : 500,
                        'zoom' : zoom
                      });
                    });
                  });
                  ref.child("/reviews/" + key).once("value", function (snap) {
                    var place = snap.val().place;
                    marker.setTitle(place.name);
                    marker.setSnippet(place.formatted_address);
                    marker.showInfoWindow();
                    marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
                      $state.go("tab.searchestablishment", {establishmentId: place.place_id});
                    });
                  });
                }
              });
            });
          }

          function onCameraChange(position) {
            $scope.map.getVisibleRegion(function (bounds) {
              var distance = GeoFire.distance(
                [bounds.northeast.lat, bounds.northeast.lng],
                [bounds.southwest.lat, bounds.southwest.lng]);

              if (geoQuery) {
                geoQuery.updateCriteria({
                  center: [position.target.lat, position.target.lng],
                  radius: distance
                });
              }
            });
          }
        }
      );
  });
