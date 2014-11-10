var accountsApp = angular.module('accountsApp', ['services']);

accountsApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

accountsApp.controller('accountsController', function($scope, $http, courseDetail, userCourses, util) {
    $scope.courses = [];
    $scope.totalCredits = 0.0;
    $scope.totalCanVary = false;

    function updateTotalCredits() {
        var total = 0.0;
        var totalCanVary = false;

        for (var i = 0; i < $scope.courses.length; i++) {
            var course = $scope.courses[i];

            if (course.credits.toLowerCase().indexOf('to') != -1)
                totalCanVary = true;

            total += parseFloat(course.credits);
        }

        $scope.totalCredits = total;
        $scope.totalCanVary = totalCanVary;
    }

    function getUserCourses() {
        userCourses.get(function(courses) {
            $scope.$evalAsync(function() {
                $scope.courses = util.convertCourses(courses);
                updateTotalCredits();
            });
        });
    }

    getUserCourses();

    $scope.removeCourse = function(crn) {
        userCourses.remove(crn, function() {
            getUserCourses();
        });
    };

    $scope.courseDetail = function(course) {
        courseDetail.open(course);
    };
});