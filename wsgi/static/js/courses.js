var coursesApp = angular.module('coursesApp',
    ['angularUtils.directives.dirPagination', 'services']);

coursesApp.config(function($interpolateProvider) {
    /* Change the Angular interpolation symbols to prevent conflict with
    Django.

    */
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

coursesApp.controller('CoursesController',
    function($scope, filters, courseDetail, userCourses, requirements, util) {
    /* Controls the operations on the 'Courses' page.

    */
    // The attribute used to order the course list.
    $scope.orderProp = 'course_id';

    // An array of all courses.
    $scope.courses = [];

    // An array of courses that pass the current filters.
    $scope.filteredCourses = [];

    // An array of current filters.
    $scope.selectedFilters = [];

    // An array of all filters.
    $scope.allFilters = [];

    // A mapping of course CRN's to button styles.
    $scope.filterStyles = {};

    // Whether or not the courses are being loaded.
    $scope.loadingCourses = false;

    // The courses that the user has selected.
    $scope.userCourses = [];

    // The function used to determine an enrollment percentage.
    $scope.enrollPercent = util.enrollPercent;

    // The object describing the pagination state of the course list.
    $scope.pagination = {
        current: 1
    };

    // The manager for the filters.
    var filterManager = new filters.FilterManager();

    // The filter objects used to filter courses.
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
        },
        {
            id: 'major',
            cleanName: 'Major',
            keywords: ['major'],
            factory: function(field, value) {
                return function(course) {
                    // requirements.courses(value, function(courses) {
                    //     TODO: FACTORY SHOULD ACCEPT PROMISES
                    // });
                    return true;
                };
            }
        }
    ];

    $scope.colorFilter = function(filter, darken) {
        /* Generate the appropriate color for a filter button.

        Parameters:
        -----------
        filter : Filter object
            The filter whose button should be colored.

        darken : bool
            Whether or not to darken the color slightly.

        */
        var h = 360 / $scope.allFilters.length *
                $scope.allFilters.indexOf(filter);
        var s = 1;
        var v = darken === true ? 0.75 : 0.85;

        var color = util.hsvToHex(h, s, v);

        $scope.filterStyles[filter.id] = {
            'background-color': color
        };
    };

    // Add the filter objects to the manager.
    filterObjs.forEach(function(filter) {
        filterManager.addFilter(filter);
        $scope.allFilters.push(filter);
    });

    // Color the button for each filter.
    $scope.allFilters.forEach(function(filter) {
        $scope.colorFilter(filter, false);
    });

    $scope.updateCoursesForFilter = function() {
        /* Update the list of shown courses based on the current filters.

        */
        $scope.filteredCourses = filterManager.filter($scope.selectedFilters,
                                                      $scope.courses);
        sessionStorage.setItem('filters',
                               JSON.stringify($scope.selectedFilters));
    };

    // Create the filter widget to display and edit filters.
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

    // Restore filters from session storage, if available.
    var storedFilters = sessionStorage.getItem('filters');
    if (storedFilters !== null) {
        $scope.selectedFilters = JSON.parse(storedFilters);
        $scope.selectedFilters.forEach(function(filter) {
            $scope.filterWidget.addFilter(filter);
        });
        $scope.updateCoursesForFilter();
    }

    function getCourses() {
        /* Get the list of all courses.

        */
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
        /* Get the list of user-selected courses.

        */
        userCourses.get(function(result) {
            $scope.$evalAsync(function() {
                $scope.userCourses = util.convertCourses(result);
            });
        });
    };

    getUserCourses();
    getCourses();

    $scope.isUserCourse = function(course) {
        /* Determine whether a course has been selected by the user.

        Parameters:
        -----------
        course : Course object
            The course to examine.

        Returns:
        --------
        A boolean representing whether or not the user has selected the
        given course.

        */
        for (var i = 0; i < $scope.userCourses.length; i++) {
            if ($scope.userCourses[i].crn == course.crn)
                return true;
        }
        return false;
    };

    $scope.toggleUserCourse = function(course) {
        /* Toggle whether a course has been selected by the user.

        Parameters:
        -----------
        course : Course object
            The course to toggle.

        */
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

    $scope.order = function(attr) {
        /* Order the courses by a given attribute.

        Parameters:
        -----------
        attr : str
            The attribute to order by.

        */
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
        /* Add a filter to the filter widget.

        Parameters:
        -----------
        filterField : str
            The name of the filter field.

        */
        $scope.filterWidget.addFilter({
            field: filterField,
            name: filterManager.keywordMap[filterField].cleanName,
            value: ''
        });
    };

    $scope.courseDetail = function(course) {
        /* Open a dialog showing the course details.

        Parameters:
        -----------
        course : Course object
            The course to show details for.

        */
        courseDetail.open(course);
    };
});
