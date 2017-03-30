
//don't touch, automatically created by gulp
angular.module("starter.settings", [])
  .constant('$constants', {
    // @if NODE_ENV == 'PRODUCTION'
    appUrl: 'https//dishing.firebaseio.com',
    awsUrl: 'https://files.rankingdeacoes.com.br/',
    awsBucket: 'files.rankingdeacoes.com.br',
    // @endif
    // @if NODE_ENV == 'DEVELOPMENT'
    appUrl: 'https//dishing-dev.firebaseio.com',
    awsUrl: 'https://dishing-test.s3-us-west-2.amazonaws.com/',
    awsBucket: 'dishing-test',
    // @endif
    awsAccess_key: 'AKIAJAU3SI6NCOUTBUWQ',
    awsSecret_key: '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'
  });