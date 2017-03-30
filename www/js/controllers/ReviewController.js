angular.module('starter.controllers')
  .controller('ReviewCtrl',
  function ($scope, $state, $ionicHistory, $stateParams,
            $placesService, ref, geofire, Auth, currentAuth, $cordovaToast, $constants,
            $ionicPopup) {

    if (typeof analytics != "undefined") analytics.trackView('Review');

    $scope.authData = currentAuth;
    $scope.review = {};

    $scope.enviando = false;

    $scope.$on("$ionicView.enter", function (event, data) {
      var place = $placesService.getPlace();
      if (place && place.place_id) {
        if (typeof analytics != "undefined") analytics.trackEvent("Review", "Place selected", place.name);
        $scope.review.place = makePlaceFromGPlace(place);
        $scope.$apply();
      }

      if (!$scope.review.photo && !$scope.enviando) {
        $scope.choosePhoto();
      }
    });

    var reviewKey = null;

    $scope.getPhoto = function (source) {

      if (typeof analytics != "undefined") analytics.trackEvent('Review', 'click', 'new review');

      navigator.camera.getPicture(function (imageURI) {
        if (typeof analytics != "undefined") analytics.trackEvent("Review", "Picture taken");

        $scope.cameraPhoto = "data:image/jpeg;base64," + imageURI;
        uploadPic(getReviewKey().key() + '.jpg', imageURI);
        $scope.$apply();
      }, function (err) {
        $state.go("tab.feeds", {}, { inherit: false });
      }, {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: true,
        encodingType: Camera.EncodingType.JPEG,
        allowEdit: true,
        targetHeight: 640,
        targetWidth: 640,
        sourceType: source
      });
    };

    $scope.choosePhoto = function () {
      var popup = $ionicPopup.show({
        title: 'Adicione uma foto',
        subTitle: 'Camera ou Galeria?',
        scope: $scope,
        buttons: [
          {
            text: '<i class="icon ion-camera"></i>',
            type: 'button-stable',
            onTap: function (e) {
              $scope.getPhoto(1);
              return 'done';
            }
          },
          {
            text: '<i class="icon ion-image"></i>',
            type: 'button-stable',
            onTap: function (e) {
              $scope.getPhoto(0);
              return 'done';
            }
          }
        ]
      });
      popup.then(function (res) {
        console.log('Tapped!', res);
      });
    }

    $scope.review.place = null;
    $scope.autocompleteOptions = {
      componentRestrictions: {},
      types: ['establishment']
    };

    $scope.review.rating = {};
    $scope.review.rating.rate = 0;

    function getReviewKey() {
      reviewKey = reviewKey || ref.child("reviews").push();
      return reviewKey;
    }

    $scope.upload = function (review) {
      reviewKey = getReviewKey();
      review.userId = $scope.authData.uid;
      review.timestamp = new Date().getTime();
      review.key = reviewKey.key();
      reviewKey.setWithPriority(review, -1 * review.timestamp);
      ref.child("users/" + $scope.authData.uid).child("feed").child(reviewKey.key()).setWithPriority(review.timestamp, -1 * review.timestamp);
      ref.child("places/" + review.place.place_id).child("feed").child(reviewKey.key()).setWithPriority(review.timestamp, -1 * review.timestamp);
      geofire.set(reviewKey.key(), [review.place.geo.lat, review.place.geo.lng]);

      if (typeof analytics != "undefined") analytics.trackEvent("Review", "Review published");

      $cordovaToast.show('Publicando...', 'long', 'center');

      cleanObjects();
      $ionicHistory.nextViewOptions({ disableBack: true });
      $ionicHistory.clearCache().then(function () { $state.go('tab.feeds', { clearCache: true }) });
    };

    $scope.goSearch = function () {
      $state.go('tab.review-search');
    }

    function cleanObjects() {
      $placesService.setPlace(null);
    }

    function makePlaceFromGPlace(gPlace) {
      return {
        name: gPlace.name,
        formatted_address: gPlace.formatted_address || gPlace.vicinity || "",
        place_id: gPlace.place_id,
        geo: {
          lat: gPlace.geometry.location.lat(),
          lng: gPlace.geometry.location.lng()
        }
      };
    }

    var uploadPic = function (fileName, base64ImageString) {

      $scope.enviando = true;
      $scope.review.photo = null;
      $cordovaToast.show('Enviando foto...', 'short', 'center');

      AWS.config.update({ accessKeyId: $constants.awsAccess_key, secretAccessKey: $constants.awsSecret_key });
      AWS.config.region = 'us-west-2';
      var bucket = new AWS.S3({ params: { Bucket: $constants.awsBucket } });

      var params = {
        Key: fileName,
        ContentType: "image/jpeg",
        ContentEncoding: 'base64',
        Body: new AWS.util.Buffer(base64ImageString, 'base64'),
        ServerSideEncryption: 'AES256',
        ACL: "public-read"
      };

      bucket.putObject(params, function (err, data) {
        if (err) {
          console.log(err.message);
          $cordovaToast.show('Erro ao enviar foto...', 'short', 'center');
          return false;
        }
        else {
          $scope.enviando = false;
          $cordovaToast.show('Foto enviada com sucesso!', 'short', 'center');
          console.log('Upload Done: ' + reviewKey.key() + '.jpg');
          console.log(data);
          $scope.review.photo = $constants.awsUrl + reviewKey.key() + '.jpg';
          $scope.$apply();
        }
      })
        .on('httpUploadProgress', function (progress) {
          console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
        });
    };
  });
