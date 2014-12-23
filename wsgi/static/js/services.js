var servicesApp = angular.module('services', ['ui.bootstrap']);

servicesApp.factory('filters', function() {
    return {
        FilterManager: function() {
            this.factories = {};
            this.keywordMap = {};

            this.addFilter = function(filter) {
                for (var i = 0; i < filter.keywords.length; i++) {
                    var keyword = filter.keywords[i];
                    this.keywordMap[keyword] = filter;
                }
                this.factories[filter.id] = filter.factory;
            };

            this.removeFilter = function(filter) {
                for (var i = 0; i < filter.keywords.length; i++) {
                    var keyword = filter.keywords[i];
                    delete this.keywordMap[keyword];
                }
                delete this.factories[filter.id];
            };

            this.factoryForId = function(id) {
                return this.factories[id];
            };

            this.filter = function(filters, objectList) {
                if (!filters)
                    return objectList;

                var filterFuncs = [];
                var result = [];

                for (var i = 0; i < filters.length; i++) {
                    var filter = filters[i];
                    var id = this.keywordMap[filter.field].id;
                    var factory = this.factoryForId(id);
                    filterFuncs.push(factory(id, filter.value));
                }

                objectList.forEach(function(obj) {
                    var ok = true;

                    filterFuncs.forEach(function(filterFunc) {
                        ok = ok && filterFunc(obj);
                    });

                    if (ok)
                        result.push(obj);
                });

                return result;
            };
        },

        exactFactory: function(field, value) {
            return function(course) {
                var fieldText = String(course[field]);
                return fieldText.toLowerCase() == value.toLowerCase();
            };
        },

        containsFactory: function(field, value) {
            return function(course) {
                var haystack = String(course[field]).toLowerCase();
                var needle = value.toLowerCase();
                return haystack.indexOf(needle) > -1;
            };
        }
    };
});

servicesApp.factory('courseDetail', function($modal) {
    return {
        open: function(course) {
            $modal.open({
                templateUrl: '/static/partials/courseDetail.html',
                controller: 'courseDetailController',
                size: 'lg',
                resolve: {
                    course: function() {
                        return course;
                    }
                }
            });
        }
    };
});

servicesApp.controller('courseDetailController',
    function($scope, $rootScope, $modalInstance, course) {
    if ($rootScope.highchartsLoaded === undefined)
        $rootScope.highchartsLoaded = false;

    $scope.course = course;
    $scope.plotType = 'pie';
    $scope.plotOptions = [
        {name: 'Pie', val: 'pie'},
        {name: 'Column', val: 'column'}
    ];

    $scope.evaluations = [];
    $scope.courseEvalCount = 0;
    $scope.instructorEvalCount = 0;
    $scope.courseComments = [];
    $scope.instructorComments = [];

    $scope.buildLock = false;
    $scope.instructorEvalLoading = true;
    $scope.courseEvalLoading = true;

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };

    $.ajax({
        url: '/evaluations/api/course/',
        data: {
            crn: course.crn
        },
        method: 'POST',
        dataType: 'json'
    }).done(function(data) {
        var name = 'course';

        createChartDOMElements(data.questions, name);
        $scope.evaluations.push({
            name: name,
            data: data
        });
        $scope.courseComments = data.comments;
        $scope.courseEvalCount += data.questions.length > 0;

        buildCharts();

        $scope.courseEvalLoading = false;
    });

    $.ajax({
        url: '/evaluations/api/instructor/',
        data: {
            crn: course.crn
        },
        method: 'POST',
        dataType: 'json'
    }).done(function(data) {
        var name = 'instr';

        createChartDOMElements(data.questions, name);
        $scope.evaluations.push({
            name: name,
            data: data
        });
        $scope.instructorComments = data.comments;
        $scope.instructorEvalCount += data.questions.length > 0;

        buildCharts();

        $scope.instructorEvalLoading = false;
    });

    function createChartDOMElements(questions, name) {
        questions.forEach(function(question, i) {
            $('#' + name + '-eval').append($('<div/>', {
                id: name + '-eval-chart-' + i,
                'class': 'chart'
            }));
        });
    }

    function alignCharts() {
        $('.chart').width($('.modal-body').width());
    }

    function buildCharts() {
        if ($scope.buildLock)
            return;

        $scope.$evalAsync(function() {
            $scope.buildLock = true;
        });

        if ($rootScope.highchartsLoaded)
            build();
        else {
            $.getScript('/static/js/lib/highcharts.js')
                .done(function() {
                $rootScope.highchartsLoaded = true;
                build();
            });
        }

        function build() {
            $scope.evaluations.forEach(function(evaluation) {
                evaluation.data.questions.forEach(function(question, i) {
                    if ($scope.plotType == 'pie')
                        buildPieChart(question, i, evaluation.name);
                    else if ($scope.plotType == 'column')
                        buildColumnChart(question, i, evaluation.name);
                    alignCharts();
                });
            });
            $scope.$evalAsync(function() {
                $scope.buildLock = false;
            });
        }
    }

    $scope.setPlotType = function(pType) {
        $scope.plotType = pType;
        buildCharts();
    };

    function buildPieChart(question, index, name) {
        var choice_data = {type: 'pie', data: []};

        question.choices.forEach(function(choice) {
            choice_data.data.push([choice.prompt, choice.percent]);
        });

        $('#' + name + '-eval-chart-' + index).highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: question.text
            },
            series: [choice_data],
            legend: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        useHTML: true,
                        format: '<strong>{point.name}</strong>: {point.y}%'
                    },
                    colors: [
                        '#7FD67A', // green
                        '#FFF34A', // yellow
                        '#FF9E4A', // orange
                        '#FF4A4A', // red
                        '#000000' // black
                    ]
                }
            },
            tooltip: {
                enabled: false
            }
        });
    }

    function buildColumnChart(question, index, name) {
        var x_bins = [];
        var choice_data = {data: []};

        question.choices.forEach(function(choice) {
            x_bins.push(choice.prompt);
            choice_data.data.push(choice.percent);
        });

        $('#' + name + '-eval-chart-' + index).highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: question.text
            },
            xAxis: {
                categories: x_bins
            },
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: 'Percentage of Students (%)'
                }
            },
            series: [choice_data],
            legend: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: '{y}%',
                        style: {
                            fontWeight: 'bold'
                        }
                    },
                    colorByPoint: true,
                    colors: [
                        '#7FD67A', // green
                        '#FFF34A', // yellow
                        '#FF9E4A', // orange
                        '#FF4A4A', // red
                        '#000000' // black
                    ]
                }
            }
        });
    }
});

servicesApp.factory('userCourses', function() {
    return {
        get: function(cb) {
            $.ajax({
                url: '/me/api/courses/',
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                cb(data);
            });
        },

        add: function(crn, cb) {
            $.ajax({
                url: '/me/api/courses/add/',
                method: 'POST',
                data: {crn: crn},
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        remove: function(crn, cb) {
            $.ajax({
                url: '/me/api/courses/remove/',
                method: 'POST',
                data: {crn: crn},
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        }
    };
});

servicesApp.factory('schedulers', function() {
    return {
        all: function(cb) {
            $.ajax({
                url: '/me/api/scheduler/all/',
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                cb(data);
            });
        },

        map: function(name, cb) {
            $.ajax({
                url: '/me/api/scheduler/map/',
                data: {name: name},
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                cb(data);
            });
        },

        add: function(name, cb) {
            $.ajax({
                url: '/me/api/scheduler/add/',
                method: 'POST',
                data: {name: name},
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        remove: function(name, cb) {
            $.ajax({
                url: '/me/api/scheduler/remove/',
                method: 'POST',
                data: {name: name},
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        setScheduler: function(name, shown, cb) {
            $.ajax({
                url: '/me/api/scheduler/set/',
                method: 'POST',
                data: {
                    name: name,
                    shown: shown
                },
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        set: function(name, crn, shown, cb) {
            $.ajax({
                url: '/me/api/scheduler/set/',
                method: 'POST',
                data: {
                    name: name,
                    crn: crn,
                    shown: shown
                },
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        rename: function(name, newName, cb) {
            $.ajax({
                url: '/me/api/scheduler/rename/',
                method: 'POST',
                data: {
                    name: name,
                    new: newName
                },
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        }
    };
});

servicesApp.factory('requirements', function() {
    return {
        majors: function(cb) {
            $.ajax({
                url: '/requirements/api/majors/',
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        degrees: function(major, cb) {
            $.ajax({
                url: '/requirements/api/degrees/',
                method: 'POST',
                data: {
                    major: major
                },
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        },

        courses: function(major, degree, cb) {
            var data;
            if (major && degree) {
                data = {
                    major: major,
                    degree: degree
                };
            } else {
                data = {
                    major: major
                };
            }

            $.ajax({
                url: '/requirements/api/courses/',
                method: 'POST',
                data: data,
                dataType: 'json'
            }).done(function(data) {
                if (cb)
                    cb(data);
            });
        }
    };
});

servicesApp.factory('util', function($timeout, $rootElement) {
    return {
        numToDistribution: function(num) {
            var result = '';

            for (var i = 0; i < num; i++) {
                result += 'I';
            }

            return result;
        },

        convertCourses: function(courses) {
            var result = [];
            var numToDistribution = this.numToDistribution;

            courses.forEach(function(course) {
                var course_id = course.subject + ' ' + course.course_number +
                                ' ' + course.section;
                var course_meeting = course.meeting_days + ' ' +
                                     course.start_time + '-' + course.end_time;

                course.course_id = course_id;
                course.meeting = course_meeting;
                course.s_distribution = numToDistribution(course.distribution);

                result.push(course);
            });

            return result;
        },

        enrollPercent: function(course) {
            if (course.enrollment <= course.max_enrollment)
                return course.enrollment / course.max_enrollment * 100;
            return 0;
        },

        alert: function(msg, type, timeout, closeBtn) {
            if (timeout === undefined)
                timeout = 3000;

            if (type === undefined)
                type = 'danger';

            var alertDOM = $('<div/>', {
                class: 'alert alert-' + type,
                html: msg,
                style: 'display: none;'
            });

            if (closeBtn !== false)
                alertDOM.prepend($('<button/>', {
                    type: 'button',
                    'data-dismiss': 'alert',
                    class: 'close',
                    text: 'x'
                }));

            $rootElement.prepend(alertDOM);
            alertDOM.slideDown(400, function() {
                if (timeout > -1)
                    $timeout(function() {
                        alertDOM.slideUp(400, function() {
                            alertDOM.remove();
                        });
                    }, timeout);
            });

            return alertDOM;
        },

        dialog: function(prompt, buttons, cb, type) {
            var dialogDOM;

            if (type === undefined)
                type = 'info';

            window.dialogFinished = function(ret) {
                if (cb !== undefined)
                    cb(ret);

                if (dialogDOM !== undefined)
                    dialogDOM.slideUp(400, function() {
                        dialogDOM.remove();
                    });
            };

            dialogDOM = $('<div/>', {
                class: 'alert alert-info text-right',
                style: 'display: none;'
            });

            dialogDOM.append($('<p/>', {
                text: prompt,
                class: 'text-left'
            }));

            var btnDOM = $('<div/>', {
                class: 'btn-group'
            });

            buttons.forEach(function(btn) {
                btnDOM.append($('<button/>', {
                    class: 'btn btn-primary',
                    html: btn.html,
                    onclick: 'dialogFinished("' + btn.val + '")'
                }));
            });

            dialogDOM.append(btnDOM);

            $rootElement.prepend(dialogDOM);
            dialogDOM.slideDown();
        },

        hsvToHex: function(h, s, v) {
            // Convert a HSV color to a hexadecimal RGB color. Uses the
            // algorithm described here:
            // http://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
            // to convert from HSV to RGB, then converts to hexadecimal.
            var r = 0, g = 0, b = 0;

            var chroma = s * v;
            var h_prime = h / 60;
            var x = chroma * (1 - Math.abs(h_prime % 2 - 1));

            if (h_prime >= 0 && h_prime < 1) {
                r = chroma;
                g = x;
                b = 0;
            } else if (h_prime >= 1 && h_prime < 2) {
                r = x;
                g = chroma;
                b = 0;
            } else if (h_prime >= 2 && h_prime < 3) {
                r = 0;
                g = chroma;
                b = x;
            } else if (h_prime >= 3 && h_prime < 4) {
                r = 0;
                g = x;
                b = chroma;
            } else if (h_prime >= 4 && h_prime < 5) {
                r = x;
                g = 0;
                b = chroma;
            } else if (h_prime >= 5 && h_prime < 6) {
                r = chroma;
                g = 0;
                b = x;
            }

            var m = v - chroma;

            r = r * 255 + m;
            g = g * 255 + m;
            b = b * 255 + m;

            return '#' + this.decToHex(r) + this.decToHex(g) + this.decToHex(b);
        },

        decToHex: function(dec) {
            var hexString = parseInt(dec, 10).toString(16);
            if (hexString == '0')
                hexString += '0';

            return hexString;
        }
    };
});
