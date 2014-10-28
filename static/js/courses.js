var coursesApp = angular.module('coursesApp', ['angularUtils.directives.dirPagination']);

coursesApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController', function($scope, $http) {
    $scope.orderProp = 'course_id';
    $scope.rawCourseFilter = '';
    $scope.courses = [];

    function getCourses() {
        $http.get('/courses/api/all/', {responseType: 'json'}).
            success(function(data, status, headers, config) {
                $scope.courses = data;
        });
    };

    getCourses();

    $scope.pagination = {
        current: 1
    };

    $scope.order = function(attr) {
        current = $scope.orderProp;
        if (current == attr && current.indexOf('-') == 0) {
            $scope.orderProp = current.substring(0);
        }
        else if (current == attr && current.indexOf('-') != 0) {
            $scope.orderProp = '-' + current;
        }
        else {
            $scope.orderProp = attr;
        }
    };

    var filterKeywords = {
        'courseid': 'course_id',
        'course id': 'course_id',
        'course_id': 'course_id'
    };

    var pattern = '[\w+]:[\w+\s*\w+]';
    var filterRegex = new RegExp(pattern, 'i');
    console.log(filterRegex.exec('courseid:ANTH123'));

    $scope.courseFilter = function(courses) {
        return courses;
    };

    $scope.detail = function(crn) {
        window.location = '/courses/' + crn;
    };
});