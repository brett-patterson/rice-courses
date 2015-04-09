define(["exports", "module", "util"], function (exports, module, _util) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var ajaxCSRF = _util.ajaxCSRF;

    var Scheduler = (function () {
        function Scheduler(id, name) {
            var map = arguments[2] === undefined ? {} : arguments[2];
            var shown = arguments[3] === undefined ? false : arguments[3];
            var editing = arguments[4] === undefined ? false : arguments[4];

            _classCallCheck(this, Scheduler);

            this.id = id;
            this.name = name;
            this.map = map;
            this.shown = shown;
            this.editing = editing;
        }

        _createClass(Scheduler, {
            getID: {
                value: function getID() {
                    return this.id;
                }
            },
            getName: {
                value: function getName() {
                    return this.name;
                }
            },
            setName: {
                value: function setName(name, cb) {
                    this.name = name;

                    ajaxCSRF({
                        url: "/me/api/scheduler/rename/",
                        method: "POST",
                        data: {
                            id: this.id,
                            name: name
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            getMap: {
                value: function getMap() {
                    return this.map;
                }
            },
            setCourseShown: {
                value: function setCourseShown(course, shown, cb) {
                    this.map[course.getCRN()] = shown;

                    ajaxCSRF({
                        url: "/me/api/scheduler/course/",
                        method: "POST",
                        data: {
                            id: this.id,
                            crn: course.getCRN(),
                            shown: shown
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            removeCourse: {
                value: function removeCourse(course, cb) {
                    if (this.map[course] !== undefined) {
                        delete this.map[course];
                    }

                    ajaxCSRF({
                        url: "/me/api/scheduler/remove-course/",
                        method: "POST",
                        data: {
                            id: this.id,
                            crn: course.getCRN()
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            getShown: {
                value: function getShown() {
                    return this.shown;
                }
            },
            setShown: {
                value: function setShown(shown, cb) {
                    this.shown = shown;

                    ajaxCSRF({
                        url: "/me/api/scheduler/set/",
                        method: "POST",
                        data: {
                            id: this.id,
                            shown: shown
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            getEditing: {
                value: function getEditing() {
                    return this.editing;
                }
            },
            setEditing: {
                value: function setEditing(editing) {
                    this.editing = editing;
                }
            },
            remove: {
                value: function remove(cb) {
                    ajaxCSRF({
                        url: "/me/api/scheduler/remove/",
                        method: "POST",
                        data: { id: this.id },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            }
        }, {
            fromJSON: {
                value: function fromJSON(j) {
                    return new Scheduler(j.id, j.name, j.map, j.shown);
                }
            },
            fetchAll: {

                /**
                 * Get all schedulers for the user.
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function fetchAll(cb) {
                    ajaxCSRF({
                        url: "/me/api/scheduler/all/",
                        method: "POST",
                        dataType: "json"
                    }).done(function (data) {
                        var result = [];

                        for (var i = 0; i < data.length; i++) {
                            result.push(Scheduler.fromJSON(data[i]));
                        }cb(result);
                    });
                }
            },
            addScheduler: {

                /**
                 * Add a new scheduler.
                 * @param {string} name - The name for the new scheduler.
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function addScheduler(name, cb) {
                    ajaxCSRF({
                        url: "/me/api/scheduler/add/",
                        method: "POST",
                        data: { name: name },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(Scheduler.fromJSON(data.scheduler));
                    });
                }
            }
        });

        return Scheduler;
    })();

    module.exports = Scheduler;
});