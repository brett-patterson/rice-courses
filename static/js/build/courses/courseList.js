define(["exports", "module", "react", "courses/course", "courses/detail/courseDetail", "courses/userCourses", "courses/filter/filterManager", "util"], function (exports, module, _react, _coursesCourse, _coursesDetailCourseDetail, _coursesUserCourses, _coursesFilterFilterManager, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var React = _interopRequire(_react);

    var Course = _interopRequire(_coursesCourse);

    var showCourseFactory = _coursesDetailCourseDetail.showCourseFactory;

    var UserCourses = _interopRequire(_coursesUserCourses);

    var FilterManager = _interopRequire(_coursesFilterFilterManager);

    var makeClasses = _util.makeClasses;
    var ajaxCSRF = _util.ajaxCSRF;
    var propTypeHas = _util.propTypeHas;
    module.exports = React.createClass({
        displayName: "courseList",

        propTypes: {
            filterManager: React.PropTypes.instanceOf(FilterManager).isRequired
        },

        getInitialState: function getInitialState() {
            return {
                courses: undefined,
                userCourses: [],
                page: 0,
                totalPages: 0,
                order: "courseID"
            };
        },

        componentWillMount: function componentWillMount() {
            this.fetchCourses();
            this.fetchUserCourses();
        },

        fetchCourses: function fetchCourses() {
            var _this = this;

            Course.get(function (data) {
                _this.setState({
                    courses: data.courses,
                    totalPages: data.pages
                });
            }, this.props.filterManager.getFiltersForServer(), this.state.page, this.state.order);
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

        onPageClickHandler: function onPageClickHandler(page) {
            var _this = this;

            return function (event) {
                _this.setState({
                    page: page
                }, _this.fetchCourses);
            };
        },

        onHeaderClickHandler: function onHeaderClickHandler(order) {
            var _this = this;

            return function (event) {
                if (_this.state.order == order && order.startsWith("-")) {
                    order = order.substring(1);
                } else if (_this.state.order == order) {
                    order = "-" + order;
                }

                _this.setState({
                    order: order
                }, _this.fetchCourses);
            };
        },

        renderCourseHeaders: function renderCourseHeaders() {
            var _this = this;

            var columns = [["crn", "CRN"], ["courseID", "Course"], ["title", "Title"], ["instructor", "Instructor"], ["meetings", "Meetings"], ["distribution", "Distribution", true], ["enrollment", "Enrollment", true], ["credits", "Credits", true]];

            var headers = columns.map(function (column) {
                var _column = _slicedToArray(column, 3);

                var key = _column[0];
                var name = _column[1];
                var center = _column[2];

                var classes = makeClasses({
                    "sort-asc": _this.state.order.substring(1) === key,
                    "sort-desc": _this.state.order === key,
                    "text-center": center
                });

                return React.createElement(
                    "th",
                    { onClick: _this.onHeaderClickHandler(key),
                        className: classes, key: key },
                    name
                );
            });

            return React.createElement(
                "tr",
                null,
                React.createElement("th", null),
                headers
            );
        },

        renderCourseRows: function renderCourseRows() {
            var _this = this;

            if (this.state.courses === undefined) {
                return React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        null,
                        "Loading courses..."
                    )
                );
            } else if (this.state.courses.length === 0) {
                return React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        null,
                        "No courses found"
                    )
                );
            }return this.state.courses.map(function (course) {
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
                    "enroll-full": percent === 100,
                    "text-center": true
                });

                return React.createElement(
                    "tr",
                    { key: course.getCRN() },
                    React.createElement(
                        "td",
                        { onClick: _this.toggleUserCourseFactory(course) },
                        React.createElement(
                            "a",
                            { className: userClasses },
                            React.createElement("span", { className: heartClasses })
                        )
                    ),
                    React.createElement(
                        "td",
                        { onClick: showCourseFactory(course) },
                        course.getCRN()
                    ),
                    React.createElement(
                        "td",
                        { onClick: showCourseFactory(course) },
                        course.getCourseID()
                    ),
                    React.createElement(
                        "td",
                        { onClick: showCourseFactory(course) },
                        course.getTitle()
                    ),
                    React.createElement(
                        "td",
                        { onClick: showCourseFactory(course) },
                        course.getInstructor()
                    ),
                    React.createElement(
                        "td",
                        { onClick: showCourseFactory(course) },
                        course.getMeetingsString()
                    ),
                    React.createElement(
                        "td",
                        { className: "text-center",
                            onClick: showCourseFactory(course) },
                        course.getDistributionString()
                    ),
                    React.createElement(
                        "td",
                        { className: enrollClasses,
                            onClick: showCourseFactory(course) },
                        course.getEnrollmentString()
                    ),
                    React.createElement(
                        "td",
                        { className: "text-center",
                            onClick: showCourseFactory(course) },
                        course.getCredits()
                    )
                );
            });
        },

        renderPagination: function renderPagination() {
            var pages = [];

            for (var i = 0; i < this.state.totalPages; i++) {
                var classes = makeClasses({
                    "course-page-button": true,
                    "course-current-page": i == this.state.page
                });

                pages.push(React.createElement(
                    "a",
                    { className: classes, key: "coursePage" + i,
                        onClick: this.onPageClickHandler(i) },
                    i + 1
                ));
            }

            return React.createElement(
                "div",
                { className: "course-pagination" },
                pages
            );
        },

        render: function render() {
            return React.createElement(
                "div",
                { className: "table-responsive" },
                React.createElement(
                    "table",
                    { className: "table table-hover course-table" },
                    React.createElement(
                        "thead",
                        null,
                        this.renderCourseHeaders()
                    ),
                    React.createElement(
                        "tbody",
                        null,
                        this.renderCourseRows()
                    )
                ),
                this.renderPagination()
            );
        }
    });
});