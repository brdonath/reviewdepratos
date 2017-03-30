angular.module('starter.controllers')
  .controller('FeedsCtrl', function ($scope, $state, $ionicHistory,
                                     $stateParams, ref, $comment, currentAuth, $ionicPopup, $review, $ionicLoading) {
    if (typeof analytics != "undefined") analytics.trackView("Feeds");

    $scope.$on("$ionicView.enter", function (event, data) {
      if (data.stateParams && data.stateParams.clearCache) {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
      }
    });

    $scope.currentAuth = currentAuth;
    $scope.reviewOnly = false;
    $scope.reviews = [];

    if ($stateParams.reviewId) {
      $scope.reviewOnly = true;
      ref.child("reviews/" + $stateParams.reviewId).once("value", function(snap){
        loadReview(snap.val());
      })
    } else {
      var scrollRef;
      if ($stateParams.user) {
        scrollRef = new Firebase.util.Scroll(ref.child("users/" + currentAuth.uid + "/feed"), '$priority');
        scrollRef.on("child_added", function (reviewKeySnap) {
          ref.child("reviews/" + reviewKeySnap.key()).once("value", function (reviewSnap) {
            loadReview(reviewSnap.val(), 5);
          });
        });
      } else {
        scrollRef = new Firebase.util.Scroll(ref.child("reviews"), '$priority');
        scrollRef.on("child_added", function (snap) {
          loadReview(snap.val(), 5);
        });
      }

      scrollRef.scroll.next(4);

      $scope.loadMore = function () {
        scrollRef.scroll.next(3);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      };
    }

    ref.child("reviews").on("child_removed", function(snap){
       $scope.reviews.forEach(function(item, index, object){
          if(item.key == snap.key()){
            object.splice(index, 1);
          }
       });
    });

    function loadReview(review, comments) {
      console.log("added: " + review.key);
      var review = review;
      $scope.reviews.push(review);
      ref.child("users").child(review.userId).once("value", function (u) {
        review.user = u.val();
        $comment.load(review.key, comments, function (comment) {
          review.comments = review.comments || {};
          review.comments[comment.key] = comment.comment;
          $scope.$apply();
        });
        $scope.$apply();
      });
      $scope.$apply();
    }

    $scope.uploadComment = function (review, newComment) {

      if (typeof analytics != "undefined") analytics.trackEvent("Feeds", "New Comment");

      $comment.upload(review, currentAuth, newComment);
      review.newComment = "";
    };

    $scope.viewEstablishment = function (establishmentId) {

      if (typeof analytics != "undefined") analytics.trackEvent("Feeds", "pageView", 'establishment');

      $state.go("tab.establishment", {'establishmentId': establishmentId});
    };

    $scope.viewReview = function(reviewKey){
      $state.go("tab.feed", { 'reviewId': reviewKey });
    };

    $scope.showConfirmDelete = function (review) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Deletar',
        template: 'Você deseja apagar esse review?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          $review.delete(review, function () {
            if($scope.reviewOnly){
              $state.go("tab.feeds");
            }
            console.log("ok");
          });
        } else {
          console.log('no');
        }
      });
    };

    $scope.openPlane = function () {
      $scope.userPlane = true;
    };
    $scope.hidePlaneContainer = function () {
      $scope.userPlane = false;
    };

    $scope.share = function (review) {
      function share() {
        var message = 'Compartilhado do Foodradar';
        window.plugins.socialsharing.share(message, 'Foodradar', review.photo, null);
      }

      $ionicLoading.show();
      window.setTimeout(share, 0);
      window.setTimeout(function () {
        $ionicLoading.hide();
      }, 2000);
    };

    $scope.optionsPhoto = function (review) {
      var btns = [
        {
          text: '<i class="icon ion-android-share-alt"></i><span>Compartilhar</span>',
          type: 'button-stable',
          onTap: function (e) {
            $scope.share(review);
          }
        },
        {
          text: '<i class="icon ion-android-alert"></i><span>Reportar abuso</span>',
          type: 'button-stable',
          onTap: function (e) {
            ref.child("reports/" + review.key + "/" + review.userId).set({abuse: true});
            $ionicPopup.alert({
              title: 'Reportar',
              template: 'Obrigado!'
            });
          }
        },
        {
          text: 'Voltar',
          type: 'button-stable',
          onTap: function (e) {
            optionsPopup.close();
          }
        }
      ];
      if (review.userId == currentAuth.uid) {
        btns.unshift({
          text: '<i class="icon ion-ios-trash-outline"></i><span>Deletar</span>',
          type: 'button-stable',
          onTap: function (e) {
            $scope.showConfirmDelete(review);
          }
        });
      }
      var optionsPopup = $ionicPopup.show({
        scope: $scope,
        cssClass: 'optionsPhoto',
        buttons: btns
      });
    }

  });
