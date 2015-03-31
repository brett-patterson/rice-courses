define(["exports", "module", "react", "reactable", "jquery", "courses/course", "courses/courseDetail", "services/userCourses", "util"], function (exports, module, _react, _reactable, _jquery, _coursesCourse, _coursesCourseDetail, _servicesUserCourses, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Table = _reactable.Table;
    var Tr = _reactable.Tr;
    var Td = _reactable.Td;

    var jQuery = _interopRequire(_jquery);

    var Course = _interopRequire(_coursesCourse);

    var showCourseFactory = _coursesCourseDetail.showCourseFactory;

    var UserCourses = _interopRequire(_servicesUserCourses);

    var makeClasses = _util.makeClasses;
    module.exports = React.createClass({
        displayName: "courseList",

        getInitialState: function getInitialState() {
            return {
                courses: undefined,
                userCourses: []
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

            jQuery.ajax({
                url: "/courses/api/all/",
                method: "POST",
                dataType: "json"
            }).done(function (result) {
                var courses = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = result[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var courseJSON = _step.value;

                        courses.push(Course.fromJSON(courseJSON));
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

                _this.setState({
                    courses: courses
                });
            });
        },

        fetchUserCourses: function fetchUserCourses(callback) {
            var _this = this;

            UserCourses.get(function (courses) {
                var userCourses = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = courses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var course = _step.value;

                        userCourses.push(course.getCRN());
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

                _this.setState({
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
                if (_this.isUserCourse(course)) {
                    UserCourses.remove(course, function () {
                        _this.fetchUserCourses(_this.forceUpdate);
                    });
                } else {
                    UserCourses.add(course, function () {
                        _this.fetchUserCourses(_this.forceUpdate);
                    });
                }
            };
        },

        getFilteredCourses: function getFilteredCourses() {
            if (this.state.courses !== undefined) {
                return this.props.filterDelegate.filter(this.state.courses);
            }return [];
        },

        render: function render() {
            var _this = this;

            var courses = undefined;
            if (this.state.courses === undefined) courses = React.createElement(
                Tr,
                null,
                React.createElement(
                    Td,
                    { column: "userCourse" },
                    "Loading courses..."
                )
            );else {
                var filtered = this.getFilteredCourses();

                if (filtered.length === 0) courses = React.createElement(
                    Tr,
                    null,
                    React.createElement(
                        Td,
                        { column: "userCourse" },
                        "No courses found"
                    )
                );else courses = filtered.map(function (course) {
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
                        )
                    );
                });
            }

            var columns = [{ key: "userCourse", label: "" }, { key: "crn", label: "CRN" }, { key: "courseID", label: "Course ID" }, { key: "title", label: "Title" }, { key: "instructor", label: "Instructor" }, { key: "meetings", label: "Meetings" }, { key: "distribution", label: "Distribution" }, { key: "enrollment", label: "Enrollment" }, { key: "credits", label: "Credits" }];

            return React.createElement(
                "div",
                { className: "table-responsive" },
                React.createElement(
                    Table,
                    { ref: "courseTable", className: "table table-hover course-table",
                        columns: columns, itemsPerPage: 50,
                        sortable: true },
                    courses
                )
            );
        }
    });
});