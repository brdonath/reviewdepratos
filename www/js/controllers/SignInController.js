angular.module('starter.controllers')
  .controller('SignInCtrl', function ($scope, $state, Auth, ref, $cordovaFacebook, $ionicHistory, $pushService, $localstorage) {

  if (typeof analytics != "undefined") analytics.trackView('SignIn');

  $scope.authData;
  Auth.$onAuth(function (authData) {
    if (authData === null) {
      console.log("Not logged in yet");
      return;
    }

    if (typeof analytics != "undefined") {
      analytics.setUserId(authData.uid);
      analytics.trackEvent("SignIn", "loggedIn", authData.uid);
    }

    $scope.authData = authData;
    console.log("Logged in as", authData.uid);

    console.log("chamando servico de registrar: " + authData.uid);

    $localstorage.set("userId", authData.uid);
    $pushService.saveRegToUser();

    fillFirebaseLogin(authData);
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go("tab.feeds");
  });
  $scope.login = function (provider) {

    if (ionic.Platform.isWebView()) {
      if (provider == "facebook") {

        $cordovaFacebook.login(["public_profile", "email"])
          .then(function (success) {
            console.log(success);
            firebaseLogin("facebook", success.authResponse.accessToken);
          });
      } else if (provider == "google") {
        window.plugins.googleplus.login(
          {
            'webClientId': '697265010527-0k1eqg1ue37k5hplqs3ri8k1kofl5eb7.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
            'offline': true
          },
          function (auth) {
            console.log(auth);
            firebaseLogin("google", auth.oauthToken);
          }
        );
      }
    } else {
      Auth.$authWithOAuthRedirect(provider, { scope: "email" })
        .then(function (authData) {
          fillFirebaseLogin(authData);
        })
        .catch(function (error) {
          if (typeof analytics != "undefined") analytics.trackEvent('SignIn', 'error login redirect', error.code);

          console.log(error);
          if (error.code === "TRANSPORT_UNAVAILABLE") {
            Auth.$authWithOAuthPopup(provider, { scope: "email" })
              .then(function (authData) {
                fillFirebaseLogin(authData);
              })
          } else {
            if (typeof analytics != "undefined") analytics.trackEvent('SignIn', 'error login general', error.code);
          }
        });
    }
  };

  var firebaseLogin = function (provider, token, noRetry) {
    if (typeof analytics != "undefined") analytics.trackEvent('SignIn', 'new login', provider);
    Auth.$authWithOAuthToken(provider, token)
      .then(function (authData) {
        console.log(authData);
        $scope.authData = authData;
        fillFirebaseLogin(authData);
      }).catch(function (error) {
      console.log(error);
      console.log("trying one more time");
      if(!noRetry){
        setTimeout(function () {
          firebaseLogin(provider, token, true);
        }, 1000);
      }
    });
  };

  var fillFirebaseLogin = function (authData) {
    console.log(authData);
    $scope.authData = authData;
    ref.child("users").child(authData.uid).update(getUser(authData));
  };

  var getUser = function (authData) {
    return {
      name: authData[authData.provider].displayName,
      email: authData[authData.provider].email || "",
      uid: authData.uid,
      imageURL: authData[authData.provider].profileImageURL || "",
      lastLogon: new Date().getTime()
    }
  }
});
