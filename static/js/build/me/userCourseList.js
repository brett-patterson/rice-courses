define(["exports", "module", "react", "reactBootstrap", "reactable", "zeroClipboard", "courses/courseDetail", "util"], function (exports, module, _react, _reactBootstrap, _reactable, _zeroClipboard, _coursesCourseDetail, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var React = _interopRequire(_react);

    var Badge = _reactBootstrap.Badge;
    var Table = _reactable.Table;
    var Tr = _reactable.Tr;
    var Td = _reactable.Td;

    var ZeroClipboard = _interopRequire(_zeroClipboard);

    var showCourseFactory = _coursesCourseDetail.showCourseFactory;
    var makeClasses = _util.makeClasses;
    module.exports = React.createClass({
        displayName: "userCourseList",

        componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
            var _this = this;

            jQuery(".copy-btn").each(function (index, button) {
                _this.clip = new ZeroClipboard(button);
            });
        },

        toggleCourseShownFactory: function toggleCourseShownFactory(course) {
            var _this = this;

            return function (event) {
                var scheduler = _this.props.scheduler;
                if (scheduler) {
                    var shown = scheduler.getMap()[course.getCRN()];
                    scheduler.setCourseShown(course, !shown);
                    _this.forceUpdate();
                    _this.props.delegate.forceUpdate();
                }
            };
        },

        removeCourseFactory: function removeCourseFactory(course) {
            var _this = this;

            return function (event) {
                event.stopPropagation();
                _this.props.delegate.removeUserCourse(course);
            };
        },

        sumCredits: function sumCredits(courses) {
            var vary = false;
            var total = 0;

            for (var i = 0; i < courses.length; i++) {
                var credits = courses[i].getCredits();

                if (credits.indexOf("to") > -1) vary = true;

                total += parseFloat(credits);
            }

            return [total.toFixed(1), vary];
        },

        getDistributionCreditsString: function getDistributionCreditsString(distributionMap) {
            var result = "";

            for (var i = 1; i <= 3; i++) {
                var _distributionMap$i = _slicedToArray(distributionMap[i], 2);

                var credits = _distributionMap$i[0];
                var vary = _distributionMap$i[1];

                if (credits > 0) {
                    var label = this.buildCreditsLabel("D" + i, vary);
                    result += "" + label + " " + credits + ", ";
                }
            }

            if (result.length === 0) {
                return result;
            }

            return result.slice(0, -2);
        },

        getDistributionMap: function getDistributionMap(courses) {
            var courseMap = {
                1: [],
                2: [],
                3: []
            };

            for (var i = 0; i < courses.length; i++) {
                var course = courses[i];
                var distribution = course.getDistribution();

                if (distribution > 0) {
                    courseMap[distribution].push(course);
                }
            }

            return {
                1: this.sumCredits(courseMap[1]),
                2: this.sumCredits(courseMap[2]),
                3: this.sumCredits(courseMap[3])
            };
        },

        buildCreditsLabel: function buildCreditsLabel(name, vary) {
            if (vary) {
                return "" + name + " (approximate):";
            }return "" + name + ":";
        },

        getTotalCredits: function getTotalCredits() {
            var distMap = this.getDistributionMap(this.props.courses);
            var distCredits = this.getDistributionCreditsString(distMap);

            var _sumCredits = this.sumCredits(this.props.courses);

            var _sumCredits2 = _slicedToArray(_sumCredits, 2);

            var creditsSum = _sumCredits2[0];
            var vary = _sumCredits2[1];

            var label = this.buildCreditsLabel("Total Credits", vary);
            return [creditsSum, label, distCredits];
        },

        getCreditsShown: function getCreditsShown() {
            var _this = this;

            var courses = [];

            if (this.props.scheduler !== undefined) {
                (function () {
                    var map = _this.props.scheduler.getMap();
                    courses = _this.props.courses.filter(function (course) {
                        return map[course.getCRN()];
                    });
                })();
            }

            var distMap = this.getDistributionMap(courses);
            var distCredits = this.getDistributionCreditsString(distMap);

            var _sumCredits = this.sumCredits(courses);

            var _sumCredits2 = _slicedToArray(_sumCredits, 2);

            var creditsSum = _sumCredits2[0];
            var vary = _sumCredits2[1];

            var label = this.buildCreditsLabel("Credits Shown", vary);

            return [creditsSum, label, distCredits];
        },

        copyButtonClicked: function copyButtonClicked(event) {
            var crn = jQuery(event.target).attr("data-clipboard-text");

            var msg = "Copied CRN <strong>" + crn + "</strong> to clipboard.";
            this.props.delegate.addAlert(msg, "success");
            event.stopPropagation();
        },

        renderCourseRows: function renderCourseRows() {
            var _this = this;

            return this.props.courses.map(function (course) {
                var courseShown = undefined;
                if (_this.props.scheduler === undefined) courseShown = true;else courseShown = _this.props.scheduler.getMap()[course.getCRN()];

                var buttonClass = courseShown ? "toggle-btn-show" : "toggle-btn-hide";
                var eyeClasses = makeClasses({
                    glyphicon: true,
                    "glyphicon-eye-open": courseShown,
                    "glyphicon-eye-close": !courseShown
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
                    ),
                    React.createElement(
                        Td,
                        { column: "remove", className: "remove-btn",
                            handleClick: _this.removeCourseFactory(course) },
                        React.createElement("span", { className: "glyphicon glyphicon-remove" })
                    )
                );
            });
        },

        renderCourseTable: function renderCourseTable() {
            var columns = [{ key: "shown", label: "" }, { key: "crn", label: "CRN" }, { key: "courseID", label: "Course" }, { key: "title", label: "Title" }, { key: "instructor", label: "Instructor" }, { key: "meetings", label: "Meetings" }, { key: "distribution", label: "Distribution" }, { key: "enrollment", label: "Enrollment" }, { key: "credits", label: "Credits" }, { key: "remove", label: "" }];

            return React.createElement(
                "div",
                { className: "table-responsive" },
                React.createElement(
                    Table,
                    { ref: "courseTable", columns: columns,
                        className: "table table-hover course-table" },
                    this.renderCourseRows()
                )
            );
        },

        renderCourseCredits: function renderCourseCredits() {
            var _getCreditsShown = this.getCreditsShown();

            var _getCreditsShown2 = _slicedToArray(_getCreditsShown, 3);

            var creditsShown = _getCreditsShown2[0];
            var shownLabel = _getCreditsShown2[1];
            var shownDist = _getCreditsShown2[2];

            var _getTotalCredits = this.getTotalCredits();

            var _getTotalCredits2 = _slicedToArray(_getTotalCredits, 3);

            var totalCredits = _getTotalCredits2[0];
            var totalLabel = _getTotalCredits2[1];
            var totalDist = _getTotalCredits2[2];

            return React.createElement(
                "div",
                { className: "course-credits" },
                React.createElement(
                    "div",
                    null,
                    shownLabel,
                    " ",
                    React.createElement(
                        "strong",
                        null,
                        creditsShown
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        Badge,
                        null,
                        shownDist
                    )
                ),
                React.createElement(
                    "div",
                    null,
                    totalLabel,
                    " ",
                    React.createElement(
                        "strong",
                        null,
                        totalCredits
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        Badge,
                        null,
                        totalDist
                    )
                )
            );
        },

        render: function render() {
            return React.createElement(
                "div",
                null,
                this.renderCourseTable(),
                this.renderCourseCredits()
            );
        }
    });
});