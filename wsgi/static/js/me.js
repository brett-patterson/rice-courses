function _slugify(text) {
    /* Convert text to a slugified form.

    Parameters:
    -----------
    text : str
        The text to be converted.

    Returns:
    --------
    A converted version of the text.

    */
    return text.toString().toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/[^\w\-]+/g, '')
               .replace(/\-\-+/g, '-')
               .replace(/^-+/, '')
               .replace(/-+$/, '');
}

var Scheduler = function(name, courses, readyCallback, schedulerService) {
    var scheduler = {
        // The name of the scheduler.
        name: name,

        // The id of the scheduler.
        id: _slugify(name),

        // The courses in the scheduler.
        courses: courses,

        // The mapping of course CRN's to whether or not they should be shown.
        showMap: {},

        // The mapping of course CRN's to an array of calendar event objects.
        eventMap: {},

        // The event sources for the calendar widget.
        eventSources: [[]],

        // Whether or not the scheduler is shown.
        shown: false,

        init: function() {
            /* Initialize the scheduler by fetching the current show map.

            */
            var _this = this;
            schedulerService.map(name, function(map) {
                _this.shown = map.shown;
                _this.courses.forEach(function(course) {
                    var events = _this._buildEventsForCourse(course);
                    _this.eventMap[course.crn] = events;

                    if (map.courses[course.crn] !== undefined)
                        _this.showMap[course.crn] = map.courses[course.crn];
                    else
                        _this.showMap[course.crn] = true;
                });

                _this.refreshEvents();
                readyCallback(_this);
            });
        },

        refreshEvents: function() {
            /* Refresh the events in the scheduler.

            */
            this.eventSources[0] = this.eventsShown();
        },

        addCourse: function(course) {
            /* Add a course to the scheduler.

            Parameters:
            -----------
            course : Course object
                The course to be added.

            */
            this.courses.push(course);
            this.eventMap[course.crn] = this._buildEventsForCourse(course);
            this.showMap[course.crn] = true;
            this.refreshEvents();
        },

        removeCourse: function(course) {
            /* Remove a course from the scheduler.

            Parameters:
            -----------
            course : Course object
                The course to be removed.

            */
            var index = this.courses.indexOf(course);

            if (index > -1) {
                this.courses.splice(index, 1);
                delete this.eventMap[course.crn];
                delete this.showMap[course.crn];
                this.refreshEvents();
            }
        },

        setShown: function(course, shown, cb) {
            /* Set a course shown or hidden in the scheduler.

            Parameters:
            -----------
            course : Course object
                The course to be shown or hidden.

            shown : bool
                Whether the course should be shown (true) or hidden (false).

            cb : function
                The callback invoked when the scheduler has been updated on
                the server.

            */
            this.showMap[course.crn] = shown;
            this.refreshEvents();
            schedulerService.set(this.name, course.crn, shown, cb);
        },

        isShown: function(course) {
            /* Return whether a course is shown in the scheduler.

            */
            return this.showMap[course.crn];
        },

        eventsShown: function() {
            /* Return an array of events that should be shown in the calendar.

            */
            var events = [];
            for (var crn in this.showMap) {
                if (this.showMap[crn])
                    Array.prototype.push.apply(events, this.eventMap[crn]);
            }
            return events;
        },

        _convertTime: function(time) {
            /* Convert a time string to a time object.

            */
            return {
                hours: time.substring(0, 2),
                minutes: time.substring(2)
            };
        },

        // A mapping of day letters to day numbers.
        _dayMap: {
            'M': '01',
            'T': '02',
            'W': '03',
            'R': '04',
            'F': '05'
        },

        _buildDates: function(days, start, end) {
            /* Build date objects given strings for the days, start times, and
            end times.

            */
            var dates = [];

            var daySplit = days.split(', ');
            var startSplit = start.split(', ');
            var endSplit = end.split(', ');

            for (var i = 0; i < daySplit.length; i++) {
                var dayString = daySplit[i];
                var startTime = this._convertTime(startSplit[i]);
                var endTime = this._convertTime(endSplit[i]);

                for (var j = 0; j < dayString.length; j++) {
                    var date = {};
                    var day = dayString[j];

                    date.start = '2007-01-' + this._dayMap[day] + 'T' +
                                 startTime.hours + ':' + startTime.minutes +
                                 ':00';
                    date.end = '2007-01-' + this._dayMap[day] + 'T' +
                                endTime.hours + ':' + endTime.minutes +
                                ':00';

                    dates.push(date);
                }
            }

            return dates;
        },

        _buildEventsForCourse: function(course) {
            /* Build event objects for a given course.

            */
            var events = [];

            var dates = this._buildDates(course.meeting_days, course.start_time,
                                        course.end_time);

            for (var i = 0; i < dates.length; i++) {
                var courseEvent = {};
                courseEvent.id = course.crn;

                if (course.color)
                    courseEvent.backgroundColor = course.color;

                courseEvent.title = course.subject + ' ' +
                                    course.course_number +
                                    ' ' + course.section;

                var date = dates[i];
                courseEvent.start = date.start;
                courseEvent.end = date.end;

                courseEvent.course = course;

                events.push(courseEvent);
            }

            return events;
        }
    };

    scheduler.init();
    return scheduler;
};

var meApp = angular.module('meApp', ['services', 'ui.calendar',
                                     'ui.bootstrap']);

meApp.config(function($interpolateProvider) {
    /* Change the Angular interpolation symbols to prevent conflict with
    Django.

    */
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

meApp.controller('meController',
    function($scope, $timeout, courseDetail, userCourses, schedulers, util) {
    // The courses that the user has selected.
    $scope.courses = [];

    // The total number of credits for all selected courses.
    $scope.totalCredits = 0.0;

    // Whether or not the total number of credits is approximate.
    $scope.totalCanVary = false;

    // The total number of credits for all shown courses.
    $scope.creditsShown = 0.0;

    // Whether or not the total number of shown credits is approximate.
    $scope.totalShownCanVary = false;

    // The array of schedulers for the user.
    $scope.schedulers = [];

    // The current selected scheduler.
    $scope.currentScheduler = null;

    // The configuration object for the calendar view.
    $scope.calendarConfig = {
        height: 'auto',
        defaultView: 'agendaWeek',
        defaultDate: new Date(2007, 0, 1).toISOString(),
        header: false,
        weekends: false,
        editable: false,
        columnFormat: 'dddd',
        allDaySlot: false,
        minTime: '08:00:00',
        maxTime: '21:00:00',
        timeFormat: 'hh:mm A',
        eventRender: function(event, element) {
            attachContextMenu(event.id, element);
        },
        eventClick: function(event, jsEvent, view) {
            $scope.courseDetail(event.course);
        }
    };

    // The function used to calculate enrollment percentage.
    $scope.enrollPercent = util.enrollPercent;

    function getCourses() {
        /* Fetch all user-selected courses.

        */
        userCourses.get(function(coursesData) {
            $scope.coursesData = coursesData;

            $scope.$evalAsync(function() {
                $scope.courses = util.convertCourses(coursesData);
                getSchedulers(coursesData);
            });
        });
    }

    getCourses();

    function getSchedulers(coursesData) {
        /* Fetch all of the users schedulers.

        */
        schedulers.all(function(names) {
            var schedulerObjs = [];
            names.forEach(function(name, index) {
                schedulerObjs.push(
                    new Scheduler(name, coursesData, function(scheduler) {
                        if (scheduler.shown === true)
                            $scope.setCurrentScheduler(scheduler);
                    }, schedulers)
                );
            });

            $scope.schedulers = schedulerObjs;
        });
    }

    function attachContextMenu(crn, element) {
        /* Attach a context menu for a course to an element.

        Parameters:
        -----------
        crn : str
            The crn of the course for the context menu.

        element : jQuery element
            The element to attach the context menu to.

        */
        element.contextmenu({
            target: '#event-menu',
            onItem: function(context, e) {
                var clicked = $(e.target).attr('data-val');
                if (clicked == 'alternate')
                    $.ajax({
                        url: '/me/api/alternate/',
                        data: {
                            crn: crn
                        },
                        method: 'POST',
                        dataType: 'json'
                    }).done(function(alternates) {
                        if (alternates.length > 0) {
                            var aCourses = util.convertCourses(alternates);

                            aCourses.forEach(function(alternate) {
                                alternate.color = '#87D175';
                                $timeout(function() {
                                    $scope.currentScheduler
                                        .addCourse(alternate);

                                    $scope.courses.push(alternate);
                                    updateTotalCredits();
                                });
                            });

                            var msg = 'Do you want to keep the added ' +
                                      'alternate sections?';

                            var yes = {
                                html: '<span class="glyphicon ' +
                                      'glyphicon-ok"></span>',
                                val: 1
                            };

                            var no = {
                                html: '<span class="glyphicon ' +
                                      'glyphicon-remove"></span>',
                                val: 0
                            };

                            util.dialog(msg, [yes, no], function(ret) {
                                if (ret == 1) {
                                    aCourses.forEach(function(alternate) {
                                        userCourses.add(alternate.crn);

                                        $timeout(function() {
                                            $scope.currentScheduler
                                                .removeCourse(alternate);
                                            delete alternate.color;
                                            $scope.currentScheduler
                                                .addCourse(alternate);
                                        });
                                    });
                                } else {
                                    aCourses.forEach(function(alternate) {
                                        $timeout(function() {
                                            $scope.currentScheduler
                                                .removeCourse(alternate);

                                            var index = $scope.courses
                                                            .indexOf(alternate);
                                            if (index > -1)
                                                $scope.courses.splice(index, 1);
                                            updateTotalCredits();
                                        });
                                    });
                                }
                            });
                        } else {
                            util.alert('No alternate, non-conflicting ' +
                                       'sections found for ' + course_id +
                                       '.');
                        }
                    });
            }
        });
    }

    function updateTotalCredits() {
        /* Update the total number of credits shown.

        */
        var total = 0.0;
        var creditsShown = 0.0;
        var totalCanVary = false;
        var totalShownCanVary = false;

        for (var i = 0; i < $scope.courses.length; i++) {
            var course = $scope.courses[i];
            var credits = parseFloat(course.credits);

            if ($scope.currentScheduler &&
                $scope.currentScheduler.isShown(course))
                creditsShown += credits;

            if (course.credits.toLowerCase().indexOf('to') != -1) {
                totalCanVary = true;

                if ($scope.currentScheduler &&
                    $scope.currentScheduler.isShown(course))
                    totalShownCanVary = true;
            }

            total += credits;
        }

        $scope.$evalAsync(function() {
            $scope.totalCredits = total;
            $scope.totalCanVary = totalCanVary;
            $scope.creditsShown = creditsShown;
            $scope.totalShownCanVary = totalShownCanVary;
        });
    }

    $scope.setCurrentScheduler = function(scheduler) {
        /* Set the current scheduler shown.

        Parameters:
        -----------
        scheduler : Scheduler object
            The scheduler to be shown.

        */
        $timeout(function() {
            $scope.currentScheduler = scheduler;
            $('#scheduler-' + scheduler.id).fullCalendar('render');
        });
        updateTotalCredits();
    };

    $scope.onSchedulerSelect = function(scheduler) {
        /* The callback invoked when a scheduler's tab is selected.

        Parameters:
        -----------
        scheduler : Scheduler object
            The scheduler that was selected.

        */
        $scope.setCurrentScheduler(scheduler);
        schedulers.setScheduler(scheduler.name, true);
    };

    $scope.addScheduler = function() {
        /* Add a new scheduler.

        */
        var counter = $scope.schedulers.length + 1;
        var name = 'Schedule ' + counter;
        schedulers.add(name, function() {
            schedulers.setScheduler(name, true, getCourses);
        });
    };

    $scope.removeScheduler = function(scheduler) {
        /* Remove a scheduler.

        Parameters:
        -----------
        scheduler : Scheduler object
            The scheduler to be removed.

        */
        var index = $scope.schedulers.indexOf(scheduler);
        schedulers.remove(scheduler.name, function() {
            if (scheduler === $scope.currentScheduler) {
                $scope.schedulers.splice(index, 1);

                if (index == $scope.schedulers.length)
                    index--;

                schedulers.setScheduler($scope.schedulers[index].name, true,
                                        getCourses);
            } else
                getCourses();
        });
    };

    $scope.renameScheduler = function(scheduler, name) {
        /* Rename a scheduler.

        Parameters:
        -----------
        scheduler : Scheduler object
            The scheduler to rename.

        name : str
            The new name for the scheduler.

        */
        schedulers.rename(scheduler.name, name, getCourses);
    };

    $scope.toggle = function(course) {
        /* Toggle whether a course is shown in the current scheduler.

        Parameters:
        -----------
        course : Course object
            The course to toggle.

        */
        var shown = $scope.currentScheduler.isShown(course);
        $scope.currentScheduler.setShown(course, !shown);
        updateTotalCredits();
    };

    $scope.removeCourse = function(course) {
        /* Remove a course from the list of user-selected courses.

        Parameters:
        -----------
        course : Course object
            The course to remove.

        */
        userCourses.remove(course.crn, function(response) {
            getCourses();
            $scope.currentScheduler.removeCourse(course);
        });
    };

    $scope.courseDetail = function(course) {
        /* Open a dialog to show course details.

        Parameters:
        -----------
        course : Course object
            The course to show details for.

        */
        courseDetail.open(course);
    };

    $scope.bindClipboard = function() {
        /* Bind the clipboard client to the copy buttons.

        */
        $scope.clipboardClient = new ZeroClipboard($('.copy-btn'));
        $scope.clipboardClient.on('copy', function(e) {
            var crn = $(e.target).attr('data-clipboard-text');
            util.alert('Copied CRN <strong>' + crn +
                       '</strong> to clipboard.', 'success');
        });
    };
});

meApp.directive('onRepeatFinish', function() {
    /* A directive that executes an expression when an ng-repeat finishes.

    */
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            if ($scope.$last == true) {
                $scope.$eval(attrs.onRepeatFinish);
            }
        }
    };
});

meApp.directive('schedulerContextMenu', function(schedulers) {
    /* A directive that binds context menu's to scheduler tabs.

    */
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var schedulerId = attrs.id;
            var scheduler;

            $scope.schedulers.forEach(function(_scheduler) {
                if (_scheduler.id === schedulerId)
                    scheduler = _scheduler;
            });

            $(element).contextmenu({
                target: '#scheduler-menu',
                onItem: function(context, e) {
                    var clicked = $(e.target).attr('data-val');
                    if (clicked === 'rename') {
                        bootbox.prompt({
                            title: 'Rename Scheduler',
                            value: $(element).attr('heading'),
                            callback: function(input) {
                                if (input !== null)
                                    $scope.renameScheduler(scheduler, input);
                            }
                        });
                    } else if (clicked === 'delete') {
                        $scope.removeScheduler(scheduler);
                    }
                }
            });
        }
    };
});
