define(["exports", "module", "jquery", "courses/course"], function (exports, module, _jquery, _coursesCourse) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var jQuery = _interopRequire(_jquery);

    var Course = _interopRequire(_coursesCourse);

    var UserCourses = (function () {
        function UserCourses() {
            _classCallCheck(this, UserCourses);
        }

        _createClass(UserCourses, null, {
            get: {
                /**
                 * Get all user selected courses.
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function get(cb) {
                    jQuery.ajax({
                        url: "/me/api/courses/",
                        method: "POST",
                        dataType: "json"
                    }).done(function (data) {
                        var result = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var courseJSON = _step.value;

                                result.push(Course.fromJSON(courseJSON));
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
            add: {

                /**
                 * Select a course for the user.
                 * @param {Course} course - The course to add
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function add(course, cb) {
                    jQuery.ajax({
                        url: "/me/api/courses/add/",
                        method: "POST",
                        data: { crn: course.getCRN() },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            },
            remove: {

                /**
                 * Deselect a course for the user.
                 * @param {Course} course - The course to remove
                 * @param {function} cb - A callback invoked with the results of the request
                 */

                value: function remove(course, cb) {
                    jQuery.ajax({
                        url: "/me/api/courses/remove/",
                        method: "POST",
                        data: { crn: course.getCRN() },
                        dataType: "json"
                    }).done(function (data) {
                        if (cb) cb(data);
                    });
                }
            }
        });

        return UserCourses;
    })();

    module.exports = UserCourses;
});