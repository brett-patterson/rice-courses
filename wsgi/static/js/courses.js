var coursesApp = angular.module('coursesApp',
    ['angularUtils.directives.dirPagination', 'services']);

coursesApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController',
    function($scope, filters, courseDetail, userCourses, requirements, util) {
    $scope.orderProp = 'course_id';
    $scope.courses = [];

    $scope.filteredCourses = [];
    $scope.selectedFilters = [];
    $scope.allFilters = [];
    $scope.filterStyles = {};

    $scope.loadingCourses = false;
    $scope.userCourses = [];

    $scope.updateCoursesForFilter = function() {
        $scope.filteredCourses = filterManager.filter($scope.selectedFilters,
                                                      $scope.courses);
        sessionStorage.setItem('filters',
                               JSON.stringify($scope.selectedFilters));
    };

    var filterManager = new filters.FilterManager();

    var filterObjs = [
        {
            id: 'crn',
            cleanName: 'CRN',
            keywords: ['crn'],
            factory: filters.containsFactory
        },

        {
            id: 'course_id',
            cleanName: 'Course ID',
            keywords: ['courseid', 'course_id', 'course id'],
            factory: filters.containsFactory
        },

        {
            id: 'title',
            cleanName: 'Title',
            keywords: ['title'],
            factory: filters.containsFactory
        },

        {
            id: 'instructor',
            cleanName: 'Instructor',
            keywords: ['instructor'],
            factory: filters.containsFactory
        },

        {
            id: 'meeting',
            cleanName: 'Meetings',
            keywords: ['meeting', 'meetings'],
            factory: filters.containsFactory
        },

        {
            id: 'credits',
            cleanName: 'Credits',
            keywords: ['credits'],
            factory: filters.containsFactory
        },

        {
            id: 's_distribution',
            cleanName: 'Distribution',
            keywords: ['dist', 'distribution'],
            factory: filters.exactFactory
        }
    ];

    $scope.colorFilter = function(filter, darken) {
        var h = 360 / $scope.allFilters.length *
                $scope.allFilters.indexOf(filter);
        var s = 1;
        var v = darken === true ? 0.75 : 0.85;

        var color = util.hsvToHex(h, s, v);

        $scope.filterStyles[filter.id] = {
            'background-color': color
        };
    };

    filterObjs.forEach(function(filter) {
        filterManager.addFilter(filter);
        $scope.allFilters.push(filter);
    });

    $scope.allFilters.forEach(function(filter) {
        $scope.colorFilter(filter, false);
    });

    $scope.filterWidget = $('#courseFilterInput').filterWidget({
        filterKeywords: filterManager.keywordMap,
        placeholder: 'Filter',
        filtersChanged: function(filters) {
            $scope.$evalAsync(function() {
                $scope.selectedFilters = filters;
                $scope.updateCoursesForFilter();
            });
        }
    });

    var storedFilters = sessionStorage.getItem('filters');
    if (storedFilters !== null) {
        JSON.parse(storedFilters).forEach(function(filter) {
            $scope.filterWidget.addFilter(filter);
        });
    }

    var filterString = sessionStorage.getItem('filters');
    if (filterString)
        $scope.selectedFilters = JSON.parse(filterString);
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
