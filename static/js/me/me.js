define(["exports", "module", "react", "reactable", "courses/courseDetail", "services/schedulers", "services/userCourses"], function (exports, module, _react, _reactable, _coursesCourseDetail, _servicesSchedulers, _servicesUserCourses) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Table = _reactable.Table;
    var Tr = _reactable.Tr;
    var Td = _reactable.Td;
    var showCourseFactory = _coursesCourseDetail.showCourseFactory;

    var Schedulers = _interopRequire(_servicesSchedulers);

    var UserCourses = _interopRequire(_servicesUserCourses);

    module.exports = React.createClass({
        displayName: "me",

        getInitialState: function getInitialState() {
            return {
                schedulers: [],
                userCourses: []
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
                }, callback);
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

        render: function render() {
            var courses = this.state.userCourses.map(function (course) {
                return React.createElement(
                    Tr,
                    { key: course.getCRN() },
                    React.createElement(
                        Td,
                        { column: "shown" },
                        React.createElement(
                            "a",
                            null,
                            React.createElement("span", { className: "glyphicon glyphicon-eye-open" })
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
                )
            );
        }
    });
});