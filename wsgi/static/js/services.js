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
});

servicesApp.factory('userCourses', function($http) {
    return {
        get: function(cb) {
            $http.get('/accounts/api/courses/current/', {responseType: 'json'}).
                success(function(data, status, headers, config) {
                    var result = [];
                    data.forEach(function(course) {
                        result.push(course.crn);
                    });
                    cb(result);
            });
        },

        add: function(crn) {
            $http.get('/accounts/api/courses/current/add/'+crn);
        },

        remove: function(crn) {
            $http.get('/accounts/api/courses/current/remove/'+crn);
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
        }
    };
});