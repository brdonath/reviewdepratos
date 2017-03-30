angular.module("starter.directives", [])
    .directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(attrs.focusMe, function (value) {
                    if (value === true) {
                        console.log('value=', value);
                        element[0].focus();
                        scope[attrs.focusMe] = false;
                    }
                });
            }
        };
    })

    .directive('hidePlane', function ($document) {
        return {
            restrict: 'A',
            link: function (scope, elem, attr, ctrl) {
                elem.bind('click', function (e) {
                    e.stopPropagation();
                });
                $document.bind('click', function () {
                    scope.$apply(attr.hidePlane);
                })
            }
        }
    });