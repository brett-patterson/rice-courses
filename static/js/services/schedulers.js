define(["exports", "module", "jquery", "me/scheduler"], function (exports, module, _jquery, _meScheduler) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var jQuery = _interopRequire(_jquery);

    var Scheduler = _interopRequire(_meScheduler);

    var Schedulers = (function () {
        function Schedulers() {
            _classCallCheck(this, Schedulers);
        }

        _createClass(Schedulers, null, {
            get: {
                /**
                 * Get all schedulers for the user.
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function get(cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/all/",
                        method: "POST",
                        dataType: "json"
                    }).done(function (data) {
                        var result = [];
                        for (var schedulerJSON in data) {
                            result.push(Scheduler.fromJSON(schedulerJSON));
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
                    jQuery.ajax({
                        url: "/me/api/scheduler/add/",
                        method: "POST",
                        data: { name: name },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            removeScheduler: {

                /**
                 * Remove a scheduler.
                 * @param {Scheduler} scheduler - The scheduler to remove
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function removeScheduler(scheduler, cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/remove/",
                        method: "POST",
                        data: { name: scheduler.getName() },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            setSchedulerShown: {

                /**
                 * Set whether a scheduler should be shown.
                 * @param {Scheduler} scheduler - The scheduler to set shown
                 * @param {boolean} shown - Whether or not the scheduler should be shown
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function setSchedulerShown(scheduler, shown, cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/set/",
                        method: "POST",
                        data: {
                            name: scheduler.getName(),
                            shown: shown
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            setCourseShown: {

                /**
                 * Set whether a course should be shown for a given scheduler.
                 * @param {Scheduler} scheduler - The scheduler to change
                 * @param {Course} course - The course to show/hide
                 * @param {boolean} shown - Whether or not the course should be shown
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function setCourseShown(scheduler, course, shown, cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/set/",
                        method: "POST",
                        data: {
                            scheduler: scheduler.getName(),
                            crn: course.getCRN(),
                            shown: shown
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            renameScheduler: {

                /**
                 * Rename a scheduler.
                 * @param {Scheduler} scheduler - The scheduler to rename
                 * @param {string} name - The new name for the scheduler
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function renameScheduler(scheduler, name, cb) {
                    jQuery.ajax({
                        url: "/me/api/scheduler/rename/",
                        method: "POST",
                        data: {
                            name: scheduler.getName(),
                            "new": name
                        },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            }
        });

        return Schedulers;
    })();

    module.exports = Schedulers;
});