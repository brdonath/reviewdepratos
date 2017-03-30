angular.module('starter.controllers')
  .controller('AccountCtrl', function ($scope, $state, $ionicPopup, Auth, $cordovaToast, currentAuth, $cordovaFacebook, ref, geofire, $placesService) {

  if (typeof analytics != "undefined") analytics.trackView('Account');

  $scope.settings = {
    enableNotifications: true
  };

  $scope.setNotifications = function (getNotifications) {
    ref.child("users/" + currentAuth.uid).update({ notifications: getNotifications });
  }
  $scope.logout = function () {

    if (typeof analytics != "undefined") analytics.trackEvent("Account", "loggedOut", currentAuth.uid);

    Auth.$unauth();
    $cordovaFacebook.logout();
    $cordovaToast.show('Bye Bye...', 'short', 'center');
    $state.go("signin");
  };

  $scope.sendFeedback = function (feedback, anonymous) {
    var timestamp = new Date().getTime();
    ref.child("feedbacks").push().setWithPriority({
      feedback: feedback,
      user: anonymous ? "anonymous" : currentAuth.uid,
      timestamp: timestamp
    }, -1 * timestamp);
    $ionicPopup.alert({
      title: 'Feedback',
      template: 'Obrigado pelo seu feedback!'
    });
  }

  $scope.goMyReviews = function () {
    $state.go("tab.accountfeeds", { user: currentAuth.uid });
  }

  $scope.showFeedback = false;

  $scope.toggleFeedback = function () {
    $scope.showFeedback = !$scope.showFeedback;
    return $scope.showFeedback;
  }
});
