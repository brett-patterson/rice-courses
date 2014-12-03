function _slugify(text) {
    return text.toString().toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/[^\w\-]+/g, '')
               .replace(/\-\-+/g, '-')
               .replace(/^-+/, '')
               .replace(/-+$/, '');
}

var Scheduler = function(name, courses, schedulerService) {
    var scheduler = {
        name: name,
        id: _slugify(name),
        courses: courses,
        showMap: {},
        eventMap: {},
        eventSources: [[]],

        init: function() {
            var _this = this;
            schedulerService.map(name, function(map) {
                _this.courses.forEach(function(course) {
                    var events = _this._buildEventsForCourse(course);
                    _this.eventMap[course.crn] = events;

                    if (map[course.crn] !== undefined)
                        _this.showMap[course.crn] = map[course.crn];
                    else
                        _this.showMap[course.crn] = true;
                });

                _this.refreshEvents();
            });
        },

        refreshEvents: function() {
            this.eventSources[0] = this.eventsShown();
        },

        addCourse: function(course) {
            this.courses.push(course);
            this.eventMap[course.crn] = this._buildEventsForCourse(course);
            this.showMap[course.crn] = true;
            this.refreshEvents();
        },

        removeCourse: function(course) {
            var index = this.courses.indexOf(course);

            if (index > -1) {
                this.courses.splice(index, 1);
                delete this.eventMap[course.crn];
                delete this.showMap[course.crn];
                this.refreshEvents();
            }
        },

        setShown: function(course, shown, cb) {
            this.showMap[course.crn] = shown;
            this.refreshEvents();
            schedulerService.set(this.name, course.crn, shown, cb);
        },

        isShown: function(course) {
            return this.showMap[course.crn];
        },

        eventsShown: function() {
            var events = [];
            for (var crn in this.showMap) {
                if (this.showMap[crn])
                    Array.prototype.push.apply(events, this.eventMap[crn]);
            }
            return events;
        },

        _convertTime: function(time) {
            return {
                hours: time.substring(0, 2),
                minutes: time.substring(2)
            };
        },

        _dayMap: {
            'M': '01',
            'T': '02',
            'W': '03',
            'R': '04',
            'F': '05'
        },

        _buildDates: function(days, start, end) {
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

                    date.start = new Date(2007, 0, this._dayMap[day],
                                          startTime.hours, startTime.minutes);
                    date.end = new Date(2007, 0, this._dayMap[day],
                                        endTime.hours, endTime.minutes);

                    dates.push(date);
                }
            }

            return dates;
        },

        _buildEventsForCourse: function(course) {
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
                courseEvent.start = date.start.toISOString();
                courseEvent.end = date.end.toISOString();

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
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

meApp.controller('meController',
    function($scope, $timeout, courseDetail, userCourses, schedulers, util) {
    $scope.courses = [];
    $scope.totalCredits = 0.0;
    $scope.totalCanVary = false;

    $scope.schedulers = [];
    $scope.currentScheduler = null;

    $scope.calendarConfig = {
        height: 500,
        defaultView: 'agendaWeek',
        defaultDate: new Date(2007, 0, 1).toISOString(),
        header: false,
        weekends: false,
        editable: false,
        columnFormat: 'dddd',
        allDaySlot: false,
        minTime: '08:00:00',
        maxTime: '21:00:00',
        eventRender: function(event, element) {
            attachContextMenu(event.id, element);
        },
        eventClick: function(event, jsEvent, view) {
            $scope.courseDetail(event.course);
        }
    };

    function getCourses() {
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
        schedulers.all(function(names) {
            var schedulerObjs = [];
            names.forEach(function(name) {
                schedulerObjs.push(
                    new Scheduler(name, coursesData, schedulers)
                );
            });

            $scope.$evalAsync(function() {
                $scope.schedulers = schedulerObjs;

                if (schedulerObjs.length > 0) {
                    $timeout(function() {
                        $scope.setCurrentScheduler(schedulerObjs[0]);
                    });
                }
            });
        });
    }

    function attachContextMenu(crn, element) {
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
        var total = 0.0;
        var creditsShown = 0.0;
        var totalCanVary = false;
        var totalShownCanVary = false;

        for (var i = 0; i < $scope.courses.length; i++) {
            var course = $scope.courses[i];
            var credits = parseFloat(course.credits);

            if ($scope.currentScheduler.isShown(course))
                creditsShown += credits;

            if (course.credits.toLowerCase().indexOf('to') != -1) {
                totalCanVary = true;

                if ($scope.currentScheduler.isShown(course))
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
        $scope.currentScheduler = scheduler;
        updateTotalCredits();
        $('#scheduler-' + scheduler.id).fullCalendar('render');
    };

    $scope.addScheduler = function() {
        var counter = $scope.schedulers.length + 1;
        schedulers.add('Schedule ' + counter, getCourses);
    };

    $scope.removeScheduler = function(scheduler) {
        schedulers.remove(scheduler.name, getCourses);
    };

    $scope.onSchedulerSelect = function(scheduler) {
        $scope.setCurrentScheduler(scheduler);
    };

    $scope.toggle = function(course) {
        var shown = $scope.currentScheduler.isShown(course);
        $scope.currentScheduler.setShown(course, !shown);
        updateTotalCredits();
    };

    $scope.enrollPercent = util.enrollPercent;

    $scope.removeCourse = function(course) {
        userCourses.remove(course.crn, function(response) {
            getCourses();
            $scope.currentScheduler.removeCourse(course);
        });
    };

    $scope.courseDetail = function(course) {
        courseDetail.open(course);
    };

    $scope.bindClipboard = function() {
        $scope.clipboardClient = new ZeroClipboard($('.copy-btn'));
        $scope.clipboardClient.on('copy', function(e) {
            var crn = $(e.target).attr('data-clipboard-text');
            util.alert('Copied CRN <strong>' + crn +
                       '</strong> to clipboard.', 'success');
        });
    };
});

meApp.directive('onRepeatFinish', function() {
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
                                    schedulers.rename(scheduler.name, input,
                                        function() {
                                            location.reload();
                                    });
                            }
                        });
                    } else if (clicked === 'delete') {
                        schedulers.remove(scheduler.name, function() {
                            location.reload();
                        });
                    }
                }
            });
        }
    };
});
