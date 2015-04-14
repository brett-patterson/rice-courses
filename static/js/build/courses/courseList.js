define(["exports", "module", "react", "reactable", "courses/course", "courses/courseDetail", "courses/userCourses", "util"], function (exports, module, _react, _reactable, _coursesCourse, _coursesCourseDetail, _coursesUserCourses, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Table = _reactable.Table;
    var Tr = _reactable.Tr;
    var Td = _reactable.Td;

    var Course = _interopRequire(_coursesCourse);

    var showCourseFactory = _coursesCourseDetail.showCourseFactory;

    var UserCourses = _interopRequire(_coursesUserCourses);

    var makeClasses = _util.makeClasses;
    var ajaxCSRF = _util.ajaxCSRF;
    module.exports = React.createClass({
        displayName: "courseList",

        getInitialState: function getInitialState() {
            return {
                courses: undefined,
                userCourses: [],
                filtered: undefined
            };
        },

        componentWillMount: function componentWillMount() {
            this.fetchCourses();
            this.fetchUserCourses();
        },

        componentDidMount: function componentDidMount() {
            this.refs.courseTable.setState({
                currentSort: {
                    column: "courseID",
                    direction: 1
                }
            });
        },

        fetchCourses: function fetchCourses() {
            var _this = this;

            Course.all(function (courses) {
                _this.setState({
                    courses: courses
                }, _this.updateFilteredCourses);
            });
        },

        fetchUserCourses: function fetchUserCourses(callback) {
            var _this = this;

            UserCourses.get(function (courses) {
                var userCourses = [];

                for (var i = 0; i < courses.length; i++) {
                    userCourses.push(courses[i].getCRN());
                }_this.setState({
                    userCourses: userCourses
                }, callback);
            });
        },

        isUserCourse: function isUserCourse(course) {
            return this.state.userCourses.indexOf(course.getCRN()) > -1;
        },

        toggleUserCourseFactory: function toggleUserCourseFactory(course) {
            var _this = this;

            return function (event) {
                var crn = course.getCRN();
                var index = _this.state.userCourses.indexOf(crn);

                if (index > -1) {
                    _this.setState(React.addons.update(_this.state, {
                        userCourses: {
                            $splice: [[index, 1]]
                        }
                    }));

                    UserCourses.remove(course);
                } else {
                    _this.setState(React.addons.update(_this.state, {
                        userCourses: {
                            $push: [crn]
                        }
                    }));

                    UserCourses.add(course);
                }
            };
        },

        updateFilteredCourses: function updateFilteredCourses() {
            var _this = this;

            if (this.state.courses !== undefined) setTimeout(function () {
                _this.setState({
                    filtered: _this.props.filterDelegate.filter(_this.state.courses)
                });
            }, 0);
        },

        renderCourseRows: function renderCourseRows() {
            var _this = this;

            if (this.state.filtered === undefined) {
                return React.createElement(
                    Tr,
                    null,
                    React.createElement(
                        Td,
                        { column: "userCourse" },
                        "Loading courses..."
                    )
                );
            } else if (this.state.filtered.length === 0) {
                return React.createElement(
                    Tr,
                    null,
                    React.createElement(
                        Td,
                        { column: "userCourse" },
                        "No courses found"
                    )
                );
            }return this.state.filtered.map(function (course) {
                var isUserCourse = _this.isUserCourse(course);

                var userClasses = makeClasses({
                    "user-course": isUserCourse,
                    "not-user-course": !isUserCourse
                });

                var heartClasses = makeClasses({
                    glyphicon: true,
                    "glyphicon-heart": isUserCourse,
                    "glyphicon-heart-empty": !isUserCourse
                });

                var percent = course.getEnrollmentPercentage();
                var enrollClasses = makeClasses({
                    "enroll-warning": percent >= 75 && percent < 100,
                    "enroll-full": percent === 100
                });

                return React.createElement(
                    Tr,
                    { key: course.getCRN() },
                    React.createElement(
                        Td,
                        { column: "userCourse",
                            handleClick: _this.toggleUserCourseFactory(course) },
                        React.createElement(
                            "a",
                            { className: userClasses },
                            React.createElement("span", { className: heartClasses })
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
                        course.getMeetingsString()
                    ),
                    React.createElement(
                        Td,
                        { column: "distribution",
                            handleClick: showCourseFactory(course) },
                        course.getDistributionString()
                    ),
                    React.createElement(
                        Td,
                        { column: "enrollment", className: enrollClasses,
                            handleClick: showCourseFactory(course) },
                        course.getEnrollmentString()
                    ),
                    React.createElement(
                        Td,
                        { column: "credits",
                            handleClick: showCourseFactory(course) },
                        course.getCredits()
                    )
                );
            });
        },

        render: function render() {
            var columns = [{ key: "userCourse", label: "" }, { key: "crn", label: "CRN" }, { key: "courseID", label: "Course" }, { key: "title", label: "Title" }, { key: "instructor", label: "Instructor" }, { key: "meetings", label: "Meetings" }, { key: "distribution", label: "Distribution" }, { key: "enrollment", label: "Enrollment" }, { key: "credits", label: "Credits" }];

            return React.createElement(
                "div",
                { className: "table-responsive" },
                React.createElement(
                    Table,
                    { ref: "courseTable", className: "table table-hover course-table",
                        columns: columns, itemsPerPage: 50,
                        sortable: true },
                    this.renderCourseRows()
                )
            );
        }
    });
});