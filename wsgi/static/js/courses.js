var coursesApp = angular.module('coursesApp',
    ['angularUtils.directives.dirPagination', 'services']);

coursesApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController',
    function($scope, filters, courseDetail, userCourses, util) {
    $scope.orderProp = 'course_id';
    $scope.courses = [];
    $scope.filteredCourses = [];
    $scope.filters = [];
    $scope.loadingCourses = false;
    $scope.userCourses = [];

    $scope.updateCoursesForFilter = function() {
        $scope.filteredCourses = filterManager.filter($scope.filters,
                                                      $scope.courses);
        sessionStorage.setItem('filters', JSON.stringify(filters));
    };

    var filterManager = filters.defaultFilterManager();

    $scope.filterWidget = $('#courseFilterInput').filterWidget({
        filterKeywords: filterManager.keywordMap,
        placeholder: 'Filter',
        filtersChanged: function(filters) {
            $scope.$evalAsync(function() {
                $scope.filters = filters;
                $scope.updateCoursesForFilter();
            });
        }
    });

    var filterString = sessionStorage.getItem('filters');
    if (filterString)
        $scope.filters = JSON.parse(filterString);
        $scope.updateCoursesForFilter();

    function getCourses() {
        $scope.loadingCourses = true;
        $.ajax({
            'url': '/courses/api/all/',
            'method': 'POST',
            'dataType': 'json'
        }).done(function(data) {
            $scope.$evalAsync(function() {
                $scope.courses = util.convertCourses(data);
                $scope.updateCoursesForFilter();
                $scope.loadingCourses = false;
            });
        });
    };

    function getUserCourses() {
        userCourses.get(function(result) {
            $scope.$evalAsync(function() {
                $scope.userCourses = util.convertCourses(result);
            });
        });
    };

    getUserCourses();
    getCourses();

    $scope.isUserCourse = function(course) {
        for (var i = 0; i < $scope.userCourses.length; i++) {
            if ($scope.userCourses[i].crn == course.crn)
                return true;
        }
        return false;
    };

    $scope.toggleUserCourse = function(course) {
        var td = $('#uc-' + course.crn);
        var span = td.find('span');
        if ($scope.isUserCourse(course)) {
            td.removeClass('user-course');
            td.addClass('not-user-course');
            span.removeClass('glyphicon-heart');
            span.addClass('glyphicon-heart-empty');
            userCourses.remove(course.crn, function() {
                getUserCourses();
            });
        } else {
            td.removeClass('not-user-course');
            td.addClass('user-course');
            span.removeClass('glyphicon-heart-empty');
            span.addClass('glyphicon-heart');
            userCourses.add(course.crn, function() {
                getUserCourses();
            });
        }
    };

    $scope.enrollPercent = util.enrollPercent;

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

    $scope.addFilterField = function(filterField) {
        $scope.filterWidget.addFilter({
            field: filterField,
            name: filterManager.keywordMap[filterField].cleanName,
            value: ''
        });
    };

    $scope.courseDetail = function(course) {
        courseDetail.open(course);
    };
});
