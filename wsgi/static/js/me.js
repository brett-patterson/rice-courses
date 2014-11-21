var meApp = angular.module('meApp', ['services']);

meApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

meApp.controller('meController', function($scope, courseDetail, userCourses, util) {
    $scope.courses = [];
    $scope.totalCredits = 0.0;
    $scope.totalCanVary = false;
    $scope.showMap = JSON.parse(sessionStorage.getItem('showMap'));
    if ($scope.showMap === null)
        $scope.showMap = {};

    var courseMap = {};

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

    $scope.enrollPercent = util.enrollPercent;

    $scope.removeCourse = function(crn) {
        userCourses.remove(crn, function(response) {
            getCourses();
        });
    };

    $scope.courseDetail = function(course) {
        courseDetail.open(course);
    };

    scheduler.skin = 'flat';

    scheduler.config.day_date = '%l'; // Display days as "Monday"
    scheduler.config.hour_date = '%h:%i %A'; // Display hours as "08:00 PM"
    scheduler.config.first_hour = 8; // Start day at 8AM
    scheduler.config.last_hour = 22; // End day at 9PM
    scheduler.config.readonly_form = true; // don't allow lightbox edits to events
    scheduler.attachEvent("onBeforeDrag", function() {return false;});
    scheduler.attachEvent("onDblCLick", function() {return false;});
    scheduler.attachEvent("onClick", function(id) {
        courseDetail.open(scheduler.getEvent(id).course);
        return false;
    });
    scheduler.config.dblclick_create = false;

    // hide Saturdays and Sundays
    scheduler.ignore_week = function(date) {
        if (date.getDay() == 6 || date.getDay() == 0)
            return true;
    };

    // Use Jan 1 2007, so that 1/1 falls on a Monday
    scheduler.init('scheduler', new Date(2007, 0, 1), 'week');

    function convertTime(time) {
        return {
            hours: time.substring(0, 2),
            minutes: time.substring(2)
        };
    };

    dayMap = {
        'M': '01',
        'T': '02',
        'W': '03',
        'R': '04',
        'F': '05'
    };

    function buildDates(days, start, end) {
        var dates = [];

        var daySplit = days.split(', ');
        var startSplit = start.split(', ');
        var endSplit = end.split(', ');

        for (var i = 0; i < daySplit.length; i++) {
            var dayString = daySplit[i];
            var startTime = convertTime(startSplit[i]);
            var endTime = convertTime(endSplit[i]);

            for (var j = 0; j < dayString.length; j++) {
                var date = {};
                var day = dayString[j];

                date.start_date = '01/' + dayMap[day] + '/2007 ' + startTime.hours + ':' + startTime.minutes;
                date.end_date = '01/' + dayMap[day] + '/2007 ' + endTime.hours + ':' + endTime.minutes;

                dates.push(date);
            };
        }

        return dates;
    };

    function dataToEvents(data) {
        var events = [];

        data.forEach(function(course, index) {
            if ($scope.showMap[course.crn] === undefined)
                $scope.showMap[course.crn] = true;

            var dates = buildDates(course.meeting_days, course.start_time, course.end_time);

            for (var i = 0; i < dates.length; i++) {
                var courseEvent = {};
                courseEvent.id = course.crn + '_' + i;
                courseEvent.course = $scope.courses[index];

                courseEvent.text = courseEvent.course.course_id;

                var date = dates[i];
                courseEvent.start_date = date.start_date;
                courseEvent.end_date = date.end_date;                

                if (courseMap[course.crn] !== undefined) {
                    courseMap[course.crn].push(courseEvent);
                }
                else
                    courseMap[course.crn] = [courseEvent];

                events.push(courseEvent);
            }
        });

        return events
    }

    function updateScheduler(course) {
        if ($scope.showMap[course.crn]) {
            courseMap[course.crn].forEach(function(event) {
                scheduler.parse([event], 'json');
            });
        }
        else {
            courseMap[course.crn].forEach(function(event) {
                scheduler.deleteEvent(event.id);
            });
        }
    }

    function getCourses() {
        userCourses.get(function(courses) {
            $scope.$evalAsync(function() {
                $scope.courses = util.convertCourses(courses);
                updateTotalCredits();
                $scope.events = dataToEvents(courses);
                $scope.courses.forEach(function(course) {
                    updateScheduler(course);
                });
            });
        });
    }

    getCourses();

    $scope.toggle = function(course) {
        $scope.showMap[course.crn] = !$scope.showMap[course.crn];
        sessionStorage.setItem('showMap', JSON.stringify($scope.showMap));

        updateScheduler(course);
    }
});