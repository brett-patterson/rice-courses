var coursesApp = angular.module('coursesApp', ['angularUtils.directives.dirPagination']);

coursesApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController', function($scope, $http) {
    $scope.orderProp = 'course_id';
    $scope.rawCourseFilter = '';
    $scope.courses = [];
    $scope.filteredCourses = [];
    $scope.loadingCourses = false;

    function getCourses() {
        $scope.loadingCourses = true;
        $http.get('/courses/api/all/', {responseType: 'json'}).
            success(function(data, status, headers, config) {
                $scope.courses = data;
                $scope.updateCoursesForFilter();
                $scope.loadingCourses = false;
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
        'crn': 'crn',
        'courseid': 'course_id',
        'course id': 'course_id',
        'course_id': 'course_id',
        'title': 'title',
        'instructor': 'instructor',
        'meeting': 'meeting',
        'meetings': 'meeting',
        'credits': 'credits'
    };

    var filterPattern = /([\w]+[\s]*[\w]*):[\s]*(.+)/i;

    var filterFactory = function(field, value) {
        return function(course) {
            var haystack = String(course[field]).toLowerCase();
            var needle = value.toLowerCase();
            return haystack.indexOf(needle) > -1;
        };
    };

    $scope.courseFilter = function(courses) {
        if ($scope.rawCourseFilter == '')
            return courses;

        var result = [];
        var filters = [];

        var expressions = $scope.rawCourseFilter.split(',');

        if (expressions.length == 0)
            return courses;

        for (var i=0; i<expressions.length; i++) {
            var expression = expressions[i];
            var matches = filterPattern.exec(expression);

            if (!matches)
                continue

            var kwd = matches[1].toLowerCase();
            var field = filterKeywords[kwd];

            if (field) {
                var value = matches[2];
                filters.push(filterFactory(field, value));
            }
        };

        courses.forEach(function(course) {
            var ok = true;

            filters.forEach(function(filter) {
                ok = ok && filter(course);
            });

            if (ok) 
                result.push(course);
        });

        return result;
    };

    $scope.updateCoursesForFilter = function() {
        $scope.filteredCourses = $scope.courseFilter($scope.courses);
    };

    $scope.addFilterField = function(filterField) {
        if ($scope.rawCourseFilter == '') {
            $scope.rawCourseFilter = filterField + ': ';
        }
        else {
            $scope.rawCourseFilter += ', ' + filterField + ': ';
        }
        $("#courseFilterInput").focus();
    };

    $scope.detail = function(crn) {
        window.location = '/courses/' + crn;
    };
});