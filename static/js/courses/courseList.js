define(["exports", "module", "react", "reactable", "jquery", "courses/course", "courses/userCourses", "util"], function (exports, module, _react, _reactable, _jquery, _coursesCourse, _coursesUserCourses, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Table = _reactable.Table;

    var jQuery = _interopRequire(_jquery);

    var Course = _interopRequire(_coursesCourse);

    var UserCourses = _interopRequire(_coursesUserCourses);

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
                        var course = _step.value;

                        courses.push(Course.fromJSON(course));
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

                        userCourses.push(course.crn);
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
            if (this.state.courses === undefined) courses = [{ userCourse: "Loading courses..." }];else {
                var filtered = this.getFilteredCourses();

                if (filtered.length === 0) courses = [{ userCourse: "No courses found" }];else courses = filtered.map(function (course) {
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

                    var userCourseElement = React.createElement(
                        "a",
                        { className: userClasses,
                            onClick: _this.toggleUserCourseFactory(course) },
                        React.createElement("span", { className: heartClasses })
                    );

                    return {
                        userCourse: userCourseElement,
                        crn: course.getCRN(),
                        courseID: course.getCourseID(),
                        title: course.getTitle(),
                        instructor: course.getInstructor(),
                        meetings: course.getMeetings(),
                        distribution: course.getDistributionString(),
                        enrollment: course.getEnrollmentString(),
                        credits: course.getCredits()
                    };
                });
            }

            var columns = [{
                key: "userCourse",
                label: ""
            }, {
                key: "crn",
                label: "CRN"
            }, {
                key: "courseID",
                label: "Course ID"
            }, {
                key: "title",
                label: "Title"
            }, {
                key: "instructor",
                label: "Instructor"
            }, {
                key: "meetings",
                label: "Meetings"
            }, {
                key: "distribution",
                label: "Distribution"
            }, {
                key: "enrollment",
                label: "Enrollment"
            }, {
                key: "credits",
                label: "Credits"
            }];

            return React.createElement(
                "div",
                { className: "table-responsive" },
                React.createElement(Table, { ref: "courseTable", className: "table table-hover course-table",
                    data: courses,
                    columns: columns, itemsPerPage: 50,
                    sortable: true })
            );
        }
    });
});