var coursesApp = angular.module('coursesApp', ['angularUtils.directives.dirPagination', 'services']);

coursesApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController', function($scope, $http, $timeout, $modal, filters, courseDetail) {
    $scope.orderProp = 'course_id';
    $scope.rawCourseFilter = '';
    $scope.courses = [];
    $scope.filteredCourses = [];
    $scope.loadingCourses = false;
    $scope.userCourses = [];

    function numToDistribution(num) {
        var result = '';

        for (var i = 0; i < num; i++) {
            result += 'I';
        }

        return result;
    };

    function convertCourses(courses) {
        var result = [];

        courses.forEach(function(course) {
            result.push({
                'crn': course.crn,
                'course_id': course.subject + ' ' + course.course_number + ' ' + course.section,
                'title': course.title,
                'instructor': course.instructor,
                'meeting': course.meeting_days + ' ' + course.start_time + '-' + course.end_time,
                'credits': course.credits,
                'distribution': numToDistribution(course.distribution),
                'description': course.description,
                'enrollment': course.enrollment,
                'max_enrollment': course.max_enrollment,
                'location': course.location
            });
        });

        return result;
    };

    function getCourses() {
        $scope.loadingCourses = true;
        $http.get('/courses/api/all/', {responseType: 'json'}).
            success(function(data, status, headers, config) {
                $scope.courses = convertCourses(data);
                $scope.updateCoursesForFilter();
                $scope.loadingCourses = false;
        });
    };

    function getUserCourses() {
        $http.get('/accounts/api/courses/current/', {responseType: 'json'}).
            success(function(data, status, headers, config) {
                var result = [];
                data.forEach(function(course) {
                    result.push(course.crn);
                });
                $timeout(function() {
                    $scope.userCourses = result;
                });
        });
    }

    getCourses();
    getUserCourses();

    $scope.isUserCourse = function(course) {
        return $scope.userCourses.indexOf(course.crn) != -1;
    };

    $scope.toggleUserCourse = function(course) {
        var action;
        var td = $('#uc-'+course.crn);
        var span = td.find('span');
        if ($scope.isUserCourse(course)) {
            action = 'remove';
            td.removeClass('user-course');
            td.addClass('not-user-course');
            span.removeClass('glyphicon-heart');
            span.addClass('glyphicon-heart-empty');
        } else {
            action = 'add';
            td.removeClass('not-user-course');
            td.addClass('user-course');
            span.removeClass('glyphicon-heart-empty');
            span.addClass('glyphicon-heart');
        }
        $http.get('/accounts/api/courses/current/'+action+'/'+course.crn);
        getUserCourses();
    };

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

    var filterManager = filters.defaultFilterManager();

    $scope.courseFilter = function(courses) {
        if ($scope.rawCourseFilter == '')
            return courses;

        return filterManager.filter($scope.rawCourseFilter, courses);
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

    $scope.courseDetail = function(course) {
        courseDetail.open(course);
    };
});