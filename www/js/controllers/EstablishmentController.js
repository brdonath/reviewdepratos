angular.module('starter.controllers')
  .controller('EstablishmentCtrl', function ($scope, $state, $stateParams, $placesService, ref, $window) {

  if (typeof analytics != "undefined") analytics.trackView('Establishment');

  $scope.reviews = [];
  $scope.place = {};

  var scrollRef = new Firebase.util.Scroll(ref.child("places/" + $stateParams.establishmentId + "/feed"), '$priority');

  scrollRef.on("child_added", function (snapshot) {
    console.log("added: " + snapshot.key());
    ref.child("reviews/" + snapshot.key()).once("value", function (review) {
      ref.child("users/" + review.val().userId).once("value", function (user) {
        var r = review.val();
        r.user = user.val();
        $scope.reviews.push(r);
        $scope.reviews.sort(function (a, b) {
          return b.timestamp - a.timestamp;
        });
        $scope.$apply();
      });
    });
  });

  scrollRef.scroll.next(4);

  $scope.loadMore = function () {
    scrollRef.scroll.next(4);
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  var mapDiv = document.getElementById("map");
  $placesService.get(mapDiv, $stateParams.establishmentId, function (place) {
    $scope.place = place;

    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    var latLng = new google.maps.LatLng(lat, lng);
    var mapLink = (ionic.Platform.isIOS()) ? 'maps://maps.apple.com/?q=' + lat + ',' + lng : 'geo:' + lat + ',' + lng + '?q=' + lat + ',' + lng;

    $scope.map = new google.maps.Map(mapDiv, {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    google.maps.event.addListenerOnce($scope.map, 'idle', function () {
      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

      var infoWindow = new google.maps.InfoWindow({
        content: "<div id='infoWindow'><b class='myplace'>" + place.name + "</b></br>" + place.formatted_address + "</div>"
      });

      infoWindow.open($scope.map, marker);

      var openMapsApp = function () {
        infoWindow.open($scope.map, marker);
        window.open(mapLink, '_system', 'location=yes');
      };

      google.maps.event.addListener(marker, 'click', openMapsApp);
      google.maps.event.addListener(infoWindow, 'domready', function () {
        google.maps.event.addDomListener(document.getElementById("infoWindow"), 'click', openMapsApp);
      });
    });

    $scope.$apply();
  });

  $scope.viewReview = function (reviewKey) {

    if (typeof analytics != "undefined") analytics.trackEvent('Establishment', 'pageView', 'feed');

    if($stateParams.fromSearch){
      $state.go("tab.searchFeed", { 'reviewId': reviewKey });
    }else {
      $state.go("tab.feed", {'reviewId': reviewKey});
    }
  };

  $scope.goReview = function () {

    if (typeof analytics != "undefined") analytics.trackEvent('Establishment', 'click', 'new Review');

    if ($scope.place) {
      $placesService.setPlace($scope.place);
    }
    $state.go("tab.review");
  }

  $scope.imgHeigth = { height: $window.innerWidth / 2 + "px" };

  $scope.imgSize = function (image) {
    if (document.getElementById('img' + image).naturalWidth > document.getElementById('img' + image).naturalHeight) {
      return { height: "100%", width: 'auto' };
    }
  }

});
