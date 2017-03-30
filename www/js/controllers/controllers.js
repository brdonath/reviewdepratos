angular.module('starter.controllers',
  ['google.places',
    'ionic.rating',
    'places.utils',
    'firebase.utils',
    'ngCordova',
    'firebase']);

angular.module('starter.controllers')
  .config(function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):|data:image\//);
    window.addEventListener('native.keyboardshow', function () {
      document.body.classList.add('keyboard-open');
      window.map.setClickable(false);
    });
    window.addEventListener('native.keyboardhide', function () {
      document.body.classList.remove('keyboard-open');
      window.map.setClickable(true);
    });
  });
