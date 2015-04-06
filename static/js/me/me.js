define(["exports", "module", "react", "reactable", "zeroClipboard", "jquery", "courses/courseDetail", "me/scheduler", "courses/userCourses", "me/schedulerView", "alertMixin", "util"], function (exports, module, _react, _reactable, _zeroClipboard, _jquery, _coursesCourseDetail, _meScheduler, _coursesUserCourses, _meSchedulerView, _alertMixin, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Table = _reactable.Table;
    var Tr = _reactable.Tr;
    var Td = _reactable.Td;

    var ZeroClipboard = _interopRequire(_zeroClipboard);

    var jQuery = _interopRequire(_jquery);

    var showCourseFactory = _coursesCourseDetail.showCourseFactory;

    var Scheduler = _interopRequire(_meScheduler);

    var UserCourses = _interopRequire(_coursesUserCourses);

    var SchedulerView = _interopRequire(_meSchedulerView);

    var AlertMixin = _interopRequire(_alertMixin);

    var makeClasses = _util.makeClasses;
    module.exports = React.createClass({
        displayName: "me",

        mixins: [AlertMixin],

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

            Scheduler.fetchAll(function (schedulers) {
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
                userCourses.sort(function (a, b) {
                    var titleA = a.getCourseID(),
                        titleB = b.getCourseID();
                    if (titleA < titleB) return -1;

                    if (titleA > titleB) return 1;

                    return 0;
                });

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

        removeCourseFactory: function removeCourseFactory(course) {
            var _this = this;

            return function (event) {
                var index = _this.state.userCourses.indexOf(course);

                if (index > -1) {
                    event.stopPropagation();
                    UserCourses.remove(course);
                    _this.setState(React.addons.update(_this.state, {
                        userCourses: {
                            $splice: [[index, 1]]
                        }
                    }));
                }
            };
        },

        componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
            var _this = this;

            jQuery(".copy-btn").each(function (index, button) {
                _this.clip = new ZeroClipboard(button);
            });
        },

        copyButtonClicked: function copyButtonClicked(event) {
            var crn = jQuery(event.target).attr("data-clipboard-text");
            this.addAlert("Copied CRN <strong>" + crn + "</strong> to clipboard.", "success");
            event.stopPropagation();
        },

        schedulerSelectFactory: function schedulerSelectFactory(scheduler) {
            var _this = this;

            return function (event) {
                _this.state.currentScheduler.setShown(false);
                scheduler.setShown(true);
                _this.setState({
                    currentScheduler: scheduler
                });
            };
        },

        schedulerRemoveFactory: function schedulerRemoveFactory(scheduler) {
            var _this = this;

            return function (event) {
                var index = _this.state.schedulers.indexOf(scheduler);

                if (index > -1) {
                    event.stopPropagation();
                    scheduler.remove();
                    _this.setState(React.addons.update(_this.state, {
                        schedulers: {
                            $splice: [[index, 1]]
                        }
                    }), function () {
                        if (_this.state.currentScheduler === scheduler) {
                            var schedulers = _this.state.schedulers;
                            var current = schedulers[index];
                            if (current === undefined) current = schedulers[schedulers.length - 1];

                            current.setShown(true);
                            _this.setState({
                                currentScheduler: current
                            });
                        }
                    });
                }
            };
        },

        addScheduler: function addScheduler() {
            var _this = this;

            Scheduler.addScheduler("New Schedule", function (scheduler) {
                _this.state.currentScheduler.setShown(false);
                scheduler.setShown(true);
                _this.setState(React.addons.update(_this.state, {
                    schedulers: {
                        $push: [scheduler]
                    },
                    currentScheduler: {
                        $set: scheduler
                    }
                }));
            });
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
                        React.createElement(
                            "span",
                            null,
                            course.getCRN() + " ",
                            React.createElement(
                                "a",
                                { className: "copy-btn",
                                    "data-clipboard-text": course.getCRN(),
                                    onClick: _this.copyButtonClicked },
                                React.createElement("span", { className: "glyphicon glyphicon-paperclip" })
                            )
                        )
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
                        { column: "remove", className: "remove-btn",
                            handleClick: _this.removeCourseFactory(course) },
                        React.createElement("span", { className: "glyphicon glyphicon-remove" })
                    )
                );
            });

            var columns = [{ key: "shown", label: "" }, { key: "crn", label: "CRN" }, { key: "courseID", label: "Course ID" }, { key: "title", label: "Title" }, { key: "instructor", label: "Instructor" }, { key: "meetings", label: "Meetings" }, { key: "distribution", label: "Distribution" }, { key: "enrollment", label: "Enrollment" }, { key: "credits", label: "Credits" }, { key: "remove", label: "" }];

            var schedulerTabs = this.state.schedulers.map(function (scheduler) {
                var closeButton = undefined;
                if (_this.state.schedulers.length > 1) closeButton = React.createElement("span", { className: "scheduler-close glyphicon glyphicon-remove",
                    onClick: _this.schedulerRemoveFactory(scheduler) });

                return React.createElement(
                    "li",
                    { key: scheduler.getID(),
                        className: scheduler.getShown() ? "active" : "" },
                    React.createElement(
                        "a",
                        { onClick: _this.schedulerSelectFactory(scheduler) },
                        React.createElement(
                            "span",
                            null,
                            scheduler.getName()
                        ),
                        closeButton
                    )
                );
            });

            return React.createElement(
                "div",
                null,
                this.getAlerts(),
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
                React.createElement(
                    "ul",
                    { className: "nav nav-tabs scheduler-tabs" },
                    schedulerTabs,
                    React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { onClick: this.addScheduler },
                            React.createElement("span", { className: "glyphicon glyphicon-plus" })
                        )
                    )
                ),
                React.createElement(SchedulerView, { ref: "schedulerView",
                    courses: this.state.userCourses,
                    scheduler: this.state.currentScheduler })
            );
        }
    });
});