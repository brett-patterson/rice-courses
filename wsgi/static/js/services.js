var servicesApp = angular.module('services', ['ui.bootstrap']);

servicesApp.factory('filters', function() {
    return {
        FilterManager: function(pattern) {
            this.filters = [];
            this.pattern = pattern;

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

            this.parseExpression = function(expression) {
                var match = this.pattern.exec(expression);

                if (!match)
                    return null;

                var kwd = match[1].toLowerCase();
                var val = match[2];
                var filter = this.filterForKeyword(kwd);

                return {
                    filter: filter,
                    value: val
                };
            };

            this.filter = function(filterString, objectList) {
                var result = [];
                var filters = [];
                var expressions = filterString.split(',');

                if (expressions.length == 0)
                    return objectList;

                for (var i = 0; i < expressions.length; i++) {
                    var filterInfo = this.parseExpression(expressions[i]);
                    if (filterInfo) {
                        var filter = filterInfo.filter;
                        var value = filterInfo.value;
                        filters.push(filter.factory(filter.id, value));
                    }
                }

                objectList.forEach(function(obj) {
                    var ok = true;

                    filters.forEach(function(filter) {
                        ok = ok && filter(obj);
                    });

                    if (ok) 
                        result.push(obj);
                });

                return result;
            };
        },

        exactFactory: function(field, value) {
            return function(course) {
                return String(course[field]).toLowerCase() == value.toLowerCase();
            };
        },

        containsFactory: function(field, value) {
            return function(course) {
                var haystack = String(course[field]).toLowerCase();
                var needle = value.toLowerCase();
                return haystack.indexOf(needle) > -1;
            };
        },

        defaultFilterManager: function() {
            manager = new this.FilterManager(/([\w]+[\s]*[\w]*):[\s]*(.+)/i);
            
            manager.addFilter({
                id: 'crn',
                keywords: ['crn'],
                factory: this.containsFactory
            });

            manager.addFilter({
                id: 'course_id',
                keywords: ['courseid', 'course_id', 'course id'],
                factory: this.containsFactory
            });

            manager.addFilter({
                id: 'title',
                keywords: ['title'],
                factory: this.containsFactory
            });

            manager.addFilter({
                id: 'instructor',
                keywords: ['instructor'],
                factory: this.containsFactory
            });

            manager.addFilter({
                id: 'meeting',
                keywords: ['meeting', 'meetings'],
                factory: this.containsFactory
            });

            manager.addFilter({
                id: 'credits',
                keywords: ['credits'],
                factory: this.containsFactory
            });

            manager.addFilter({
                id: 'distribution',
                keywords: ['dist', 'distribution'],
                factory: this.exactFactory
            });

            return manager;       
        },
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

servicesApp.controller('courseDetailController', function($scope, $modalInstance, course) {
    $scope.course = course;

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };

    $('.chart').css('width', $('.modal-body').width());

    $.getScript('http://code.highcharts.com/highcharts.src.js').done(function() {
       $('#course-eval-chart').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Monthly Average Rainfall'
        },
        subtitle: {
            text: 'Source: WorldClimate.com'
        },
        xAxis: {
            categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ]
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Rainfall (mm)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Tokyo',
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

        }, {
            name: 'New York',
            data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

        }, {
            name: 'London',
            data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

        }, {
            name: 'Berlin',
            data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]

        }]
    });
    });
});

servicesApp.factory('userCourses', function() {
    return {
        get: function(cb) {
            $.ajax({
                url:'/accounts/api/courses/',
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                cb(data);
            });
        },

        add: function(crn, cb) {
            $.ajax({
                url:'/accounts/api/courses/add/',
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
                url:'/accounts/api/courses/remove/',
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

servicesApp.factory('util', function() {
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
        }
    };
});