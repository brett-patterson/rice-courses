var coursesApp = angular.module('coursesApp', ['ui.bootstrap', 'angularUtils.directives.dirPagination']);

coursesApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController', function($scope, $http, $timeout, $modal) {
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

    var exactFactory = function(field, value) {
        return function(course) {
            return String(course[field]).toLowerCase() == value.toLowerCase();
        };
    };

    var containsFactory = function(field, value) {
        return function(course) {
            var haystack = String(course[field]).toLowerCase();
            var needle = value.toLowerCase();
            return haystack.indexOf(needle) > -1;
        };
    };

    var FilterManager = function() {
        this.filters = [];

        this.addFilter = function(filter) {
            if (this.filters.indexOf(filter) == -1)
                this.filters.push(filter);
        };

        this.removeFilter = function(filter) {
            var index = this.filters.indexOf(filter);
            if (index > -1)
                this.filters.splice(index, 1);
        };

        this.filterForKeyword = function(keyword) {
            for (var i = 0; i < this.filters.length; i++) {
                var filter = this.filters[i];

                if (filter.keywords.indexOf(keyword) > -1)
                    return filter;
            }

            return null;
        };
    };

    var crnFilter = {
        id: 'crn',
        keywords: ['crn'],
        factory: containsFactory
    };

    var courseIdFilter = {
        id: 'course_id',
        keywords: ['courseid', 'course_id', 'course id'],
        factory: containsFactory
    };

    var titleFilter = {
        id: 'title',
        keywords: ['title'],
        factory: containsFactory
    };

    var instructorFilter = {
        id: 'instructor',
        keywords: ['instructor'],
        factory: containsFactory
    };

    var meetingFilter = {
        id: 'meeting',
        keywords: ['meeting', 'meetings'],
        factory: containsFactory
    };

    var creditsFilter = {
        id: 'credits',
        keywords: ['credits'],
        factory: containsFactory
    };

    var distributionFilter = {
        id: 'distribution',
        keywords: ['dist', 'distribution'],
        factory: exactFactory
    };

    var filterManager = new FilterManager();

    filterManager.addFilter(crnFilter);
    filterManager.addFilter(courseIdFilter);
    filterManager.addFilter(titleFilter);
    filterManager.addFilter(instructorFilter);
    filterManager.addFilter(meetingFilter);
    filterManager.addFilter(creditsFilter);
    filterManager.addFilter(distributionFilter);

    var filterPattern = /([\w]+[\s]*[\w]*):[\s]*(.+)/i;

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
            var filter = filterManager.filterForKeyword(kwd);

            if (filter) {
                var field = filter.id;
                var value = matches[2];
                filters.push(filter.factory(field, value));
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

    $scope.courseDetail = function(course) {
        $modal.open({
            templateUrl: '/static/partials/courseDetail.html',
            controller: 'courseDetailController',
            resolve: {
                course: function() {
                    return course;
                }
            }
        });
    };
});

coursesApp.controller('courseDetailController', function($scope, $modalInstance, course) {
    $scope.course = course;

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
});