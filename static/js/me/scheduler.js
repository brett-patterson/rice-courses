define(["exports", "module", "jquery"], function (exports, module, _jquery) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var jQuery = _interopRequire(_jquery);

    var Scheduler = (function () {
        function Scheduler(name) {
            var map = arguments[1] === undefined ? {} : arguments[1];
            var shown = arguments[2] === undefined ? false : arguments[2];

            _classCallCheck(this, Scheduler);

            this.name = name;
            this.map = map;
            this.shown = shown;
        }

        _createClass(Scheduler, {
            getName: {
                value: function getName() {
                    return this.name;
                }
            },
            setName: {
                value: function setName(name, cb) {
                    this.name = name;

                    jQuery.ajax({
                        url: "/me/api/scheduler/rename/",
                        method: "POST",
                        data: {
                            name: this.name,
                            "new": name
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

                    jQuery.ajax({
                        url: "/me/api/scheduler/course/",
                        method: "POST",
                        data: {
                            scheduler: this.name,
                            crn: course.getCRN(),
                            shown: shown
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

                    jQuery.ajax({
                        url: "/me/api/scheduler/set/",
                        method: "POST",
                        data: {
                            name: this.name,
                            shown: shown
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            remove: {
                value: function remove(cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/remove/",
                        method: "POST",
                        data: { name: this.name },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            }
        }, {
            fromJSON: {
                value: function fromJSON(j) {
                    return new Scheduler(j.name, j.map, j.shown);
                }
            },
            fetchAll: {

                /**
                 * Get all schedulers for the user.
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function fetchAll(cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/all/",
                        method: "POST",
                        dataType: "json"
                    }).done(function (data) {
                        var result = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var schedulerJSON = _step.value;

                                result.push(Scheduler.fromJSON(schedulerJSON));
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        cb(result);
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
                    jQuery.ajax({
                        url: "/me/api/scheduler/add/",
                        method: "POST",
                        data: { name: name },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            }
        });

        return Scheduler;
    })();

    module.exports = Scheduler;
});