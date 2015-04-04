define(["exports", "module", "react", "reactable", "courses/courseDetail", "services/schedulers", "services/userCourses", "me/schedulerView", "util"], function (exports, module, _react, _reactable, _coursesCourseDetail, _servicesSchedulers, _servicesUserCourses, _meSchedulerView, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Table = _reactable.Table;
    var Tr = _reactable.Tr;
    var Td = _reactable.Td;
    var showCourseFactory = _coursesCourseDetail.showCourseFactory;

    var Schedulers = _interopRequire(_servicesSchedulers);

    var UserCourses = _interopRequire(_servicesUserCourses);

    var SchedulerView = _interopRequire(_meSchedulerView);

    var makeClasses = _util.makeClasses;
    module.exports = React.createClass({
        displayName: "me",

        getInitialState: function getInitialState() {
            return {
                schedulers: [],
                userCourses: [],
                currentScheduler: undefined
            };
        },

        componentWillMount: function componentWillMount() {
            this.fetchUserCourses();
            this.fetchSchedulers();
        },

        fetchSchedulers: function fetchSchedulers(callback) {
            var _this = this;

            Schedulers.get(function (schedulers) {
                _this.setState({
                    schedulers: schedulers
                }, function () {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _this.state.schedulers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var scheduler = _step.value;

                            if (scheduler.getShown()) _this.setState({
                                currentScheduler: scheduler
                            });
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
                });
            });
        },

        fetchUserCourses: function fetchUserCourses(callback) {
            var _this = this;

            UserCourses.get(function (userCourses) {
                _this.setState({
                    userCourses: userCourses
                }, callback);
            });
        },

        toggleCourseShownFactory: function toggleCourseShownFactory(course) {
            var _this = this;

            return function (event) {
                var scheduler = _this.state.currentScheduler;
                if (scheduler) {
                    var shown = scheduler.getMap()[course.getCRN()];
                    scheduler.setCourseShown(course, !shown);
                    _this.forceUpdate();
                }
            };
        },

        render: function render() {
            var _this = this;

            var courses = this.state.userCourses.map(function (course) {
                var courseShown = undefined;
                if (_this.state.currentScheduler === undefined) courseShown = true;else courseShown = _this.state.currentScheduler.getMap()[course.getCRN()];

                var buttonClass = courseShown ? "toggle-btn-show" : "toggle-btn-hide";
                var eyeClasses = makeClasses({
                    glyphicon: true,
                    "glyphicon-eye-open": courseShown,
                    "glyphicon-eye-close": !courseShown
                });

                return React.createElement(
                    Tr,
                    { key: course.getCRN() },
                    React.createElement(
                        Td,
                        { column: "shown",
                            handleClick: _this.toggleCourseShownFactory(course) },
                        React.createElement(
                            "a",
                            { className: buttonClass },
                            React.createElement("span", { className: eyeClasses })
                        )
                    ),
                    React.createElement(
                        Td,
                        { column: "crn",
                            handleClick: showCourseFactory(course) },
                        course.getCRN()
                    ),
                    React.createElement(
                        Td,
                        { column: "courseID",
                            handleClick: showCourseFactory(course) },
                        course.getCourseID()
                    ),
                    React.createElement(
                        Td,
                        { column: "title",
                            handleClick: showCourseFactory(course) },
                        course.getTitle()
                    ),
                    React.createElement(
                        Td,
                        { column: "instructor",
                            handleClick: showCourseFactory(course) },
                        course.getInstructor()
                    ),
                    React.createElement(
                        Td,
                        { column: "meetings",
                            handleClick: showCourseFactory(course) },
                        course.getMeetings()
                    ),
                    React.createElement(
                        Td,
                        { column: "distribution",
                            handleClick: showCourseFactory(course) },
                        course.getDistributionString()
                    ),
                    React.createElement(
                        Td,
                        { column: "enrollment",
                            handleClick: showCourseFactory(course) },
                        course.getEnrollmentString()
                    ),
                    React.createElement(
                        Td,
                        { column: "credits",
                            handleClick: showCourseFactory(course) },
                        course.getCredits()
                    ),
                    React.createElement(
                        Td,
                        { column: "remove", className: "remove-btn" },
                        React.createElement("span", { className: "glyphicon glyphicon-remove" })
                    )
                );
            });

            var columns = [{ key: "shown", label: "" }, { key: "crn", label: "CRN" }, { key: "courseID", label: "Course ID" }, { key: "title", label: "Title" }, { key: "instructor", label: "Instructor" }, { key: "meetings", label: "Meetings" }, { key: "distribution", label: "Distribution" }, { key: "enrollment", label: "Enrollment" }, { key: "credits", label: "Credits" }, { key: "remove", label: "" }];

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "table-responsive" },
                    React.createElement(
                        Table,
                        { ref: "courseTable", columns: columns,
                            className: "table table-hover course-table" },
                        courses
                    )
                ),
                React.createElement(SchedulerView, { ref: "schedulerView",
                    courses: this.state.userCourses,
                    scheduler: this.state.currentScheduler })
            );
        }
    });
});