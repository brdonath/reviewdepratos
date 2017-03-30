angular.module('starter.controllers')
  .controller('ReviewSearchCtrl', function ($scope, $state, $placesService, $ionicLoading, $ionicHistory) {
  $placesService.nearbySearch(document.createElement("div"), function (places) {
    $scope.nearbyPlaces = places;
    $scope.$apply();
  });

  $scope.search = function (event, query) {
    if (event.which != 13) {
      return;
    }

    $ionicLoading.show();
    $placesService.search(document.createElement('div'), query,
      function (places) {
        $ionicLoading.hide();
        $scope.noResults = false;
        $scope.searchPlaces = places;
        $scope.$apply();
      },
      function () {
        $ionicLoading.hide();
        $scope.noResults = true;
        $scope.$apply();
      });
  }

  $scope.control = {};
  $scope.$on("$ionicView.beforeLeave", function () {
    if ($scope.control.clearPredictions) {
      $scope.control.clearPredictions();
    }
  });

  $scope.placeSelected = function (place) {
    if (place && place.place_id) {
      $placesService.setPlace(place);
      $ionicHistory.nextViewOptions({ disableBack: true });
      $state.go("tab.review");
    }
  }

})
