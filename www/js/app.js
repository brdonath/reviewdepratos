// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic',
    'starter.settings',
    'starter.filters',
    'starter.directives',
    'starter.controllers',
    'starter.services',
    'templates'])
  .config(['$compileProvider', '$ionicConfigProvider', function ($compileProvider, $ionicConfigProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):|data:image\//);
    $ionicConfigProvider.tabs.position('bottom');
  }])
  .run(function ($ionicPlatform, $rootScope, $state, $pushService) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      if (typeof analytics != "undefined") {
        analytics.startTrackerWithId("UA-75623934-1");
        console.log('analytics ok');
      } else {
        console.log("Google Analytics indisponível");
      }

      if(window.plugin){
        window.map = plugin.google.maps.Map;
      }

      $pushService.register();
    });
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
      if (error === "AUTH_REQUIRED") {
        $state.go("signin");
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {


    $stateProvider
      .state('signin', {
        cache: false,
        url: '/sign-in',
        templateUrl: 'templates/sign-in.html',
        controller: 'SignInCtrl'
      })
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireAuth();
          }]
        }
      })

      // Each tab has its own nav history stack:

      .state('tab.review', {
        url: '/review',
        views: {
          'tab-review': {
            templateUrl: 'templates/tab-review.html',
            controller: 'ReviewCtrl'
          }
        }
      })
      .state('tab.review-search', {
        url: '/review-search',
        cache: false,
        views: {
          'tab-review': {
            templateUrl: 'templates/tab-review-search.html',
            controller: 'ReviewSearchCtrl'
          }
        }
      })
      .state('tab.feeds', {
        url: '/feeds',
        params: {'user': null, clearCache : false },
        views: {
          'tab-feeds': {
            templateUrl: 'templates/tab-feeds.html',
            controller: 'FeedsCtrl'
          }
        }
      })
      .state('tab.establishment', {
        url: '/establishment/:establishmentId',
        cache: false,
        views: {
          'tab-feeds': {
            templateUrl: 'templates/establishment.html',
            controller: 'EstablishmentCtrl'
          }
        }
      })
      .state('tab.feed', {
        url: '/feed/:reviewId',
        views: {
          'tab-feeds': {
            templateUrl: 'templates/tab-feeds.html',
            controller: 'FeedsCtrl'
          }
        }
      })
      .state('tab.search', {
        url: '/search',
        cache: true,
        views: {
          'tab-search': {
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl'
          }
        }
      })
      .state('tab.searchestablishment', {
        url: '/establishment/:establishmentId',
        params : {fromSearch : true},
        cache:false,
        views: {
          'tab-search': {
            templateUrl: 'templates/establishment.html',
            controller: 'EstablishmentCtrl'
          }
        }
      })
      .state('tab.searchFeed', {
        url: '/feed/:reviewId',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-feeds.html',
            controller: 'FeedsCtrl'
          }
        }
      })
      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })
      .state('tab.accountfeeds', {
        url: '/account/feeds',
        params: {'user': null, clearCache : false },
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-feeds.html',
            controller: 'FeedsCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/sign-in');

    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.backButton.text('').icon('ion-chevron-left');
    $ionicConfigProvider.scrolling.jsScrolling(false);

  });
