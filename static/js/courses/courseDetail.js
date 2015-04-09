define(["exports", "react", "reactBootstrap", "bootbox", "jquery", "courses/evaluationChart", "util"], function (exports, _react, _reactBootstrap, _bootbox, _jquery, _coursesEvaluationChart, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    exports.showCourseFactory = showCourseFactory;
    exports.showCourseDetail = showCourseDetail;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var React = _interopRequire(_react);

    var TabbedArea = _reactBootstrap.TabbedArea;
    var TabPane = _reactBootstrap.TabPane;

    var Bootbox = _interopRequire(_bootbox);

    var jQuery = _interopRequire(_jquery);

    var EvaluationChart = _interopRequire(_coursesEvaluationChart);

    var makeClasses = _util.makeClasses;
    var ajaxCSRF = _util.ajaxCSRF;

    var CourseDetailBody = React.createClass({
        displayName: "CourseDetailBody",

        getInitialState: function getInitialState() {
            return {
                courseQuestions: undefined,
                courseComments: undefined,
                instructorQuestions: undefined,
                instructorComments: undefined,
                chartType: "pie"
            };
        },

        componentWillMount: function componentWillMount() {
            var _this = this;

            ajaxCSRF({
                url: "/evaluation/api/course/",
                method: "POST",
                data: {
                    crn: this.props.course.crn
                },
                responseType: "json"
            }).done(function (result) {
                _this.setState({
                    courseQuestions: result.questions,
                    courseComments: result.comments
                });
            });

            ajaxCSRF({
                url: "/evaluation/api/instructor/",
                method: "POST",
                data: {
                    crn: this.props.course.crn
                },
                responseType: "json"
            }).done(function (result) {
                _this.setState({
                    instructorQuestions: result.questions,
                    instructorComments: result.comments
                });
            }).fail(function (result) {
                console.log(result);
            });
        },

        render: function render() {
            var _this = this;

            var course = this.props.course;

            var prerequisites = undefined,
                corequisites = undefined,
                restrictions = undefined;
            if (course.getPrerequisites().length > 0) prerequisites = React.createElement(
                "p",
                null,
                React.createElement(
                    "strong",
                    null,
                    "Prerequisites:"
                ),
                " ",
                course.getPrerequisites()
            );
            if (course.getCorequisites().length > 0) corequisites = React.createElement(
                "p",
                null,
                React.createElement(
                    "strong",
                    null,
                    "Corequisites:"
                ),
                " ",
                course.getCorequisites()
            );
            if (course.getRestrictions().length > 0) restrictions = React.createElement(
                "p",
                null,
                React.createElement(
                    "strong",
                    null,
                    "Restrictions:"
                ),
                " ",
                course.getRestrictions()
            );

            var courseCharts = undefined;
            if (this.state.courseQuestions === undefined) {
                courseCharts = "Loading...";
            } else if (this.state.courseQuestions.length === 0) {
                courseCharts = "No evaluations found";
            } else {
                courseCharts = this.state.courseQuestions.map(function (question, i) {
                    return React.createElement(EvaluationChart, { key: "courseEvalChart" + i,
                        title: question.text,
                        data: question.choices,
                        type: _this.state.chartType });
                });
            }

            var courseComments = undefined;
            if (this.state.courseComments === undefined) {
                courseComments = "Loading...";
            } else if (this.state.courseComments.length === 0) {
                courseComments = "No comments found";
            } else {
                courseComments = this.state.courseComments.map(function (comment, i) {
                    return React.createElement(
                        "div",
                        { className: "comment", key: "courseComment" + i },
                        React.createElement(
                            "p",
                            null,
                            comment.text
                        ),
                        React.createElement(
                            "p",
                            { className: "comment-date" },
                            comment.date
                        )
                    );
                });
            }

            var instructorCharts = undefined;
            if (this.state.instructorQuestions === undefined) {
                instructorCharts = "Loading...";
            } else if (this.state.instructorQuestions.length === 0) {
                instructorCharts = "No evaluations found";
            } else {
                instructorCharts = this.state.instructorQuestions.map(function (question, i) {
                    return React.createElement(EvaluationChart, { key: "instructorEvalChart" + i,
                        title: question.text,
                        data: question.choices,
                        type: _this.state.chartType });
                });
            }

            var instructorComments = undefined;
            if (this.state.instructorComments === undefined) {
                instructorComments = "Loading...";
            } else if (this.state.instructorComments.length === 0) {
                instructorComments = "No comments found";
            } else {
                instructorComments = this.state.instructorComments.map(function (comment, i) {
                    return React.createElement(
                        "div",
                        { className: "comment", key: "instructorComment" + i },
                        React.createElement(
                            "p",
                            null,
                            comment.text
                        ),
                        React.createElement(
                            "p",
                            { className: "comment-date" },
                            comment.date
                        )
                    );
                });
            }

            return React.createElement(
                TabbedArea,
                { defaultActiveKey: 1, animation: false },
                React.createElement(
                    TabPane,
                    { eventKey: 1, tab: "Info" },
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "strong",
                            null,
                            "Credits:"
                        ),
                        " ",
                        course.getCredits()
                    ),
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "strong",
                            null,
                            "Distribution:"
                        ),
                        " ",
                        course.getDistributionString()
                    ),
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "strong",
                            null,
                            "Meetings:"
                        ),
                        " ",
                        course.getMeetingsString()
                    ),
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "strong",
                            null,
                            "Location:"
                        ),
                        " ",
                        course.getLocation()
                    ),
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "strong",
                            null,
                            "Enrollment:"
                        ),
                        " ",
                        course.getEnrollmentString()
                    ),
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "strong",
                            null,
                            "Waitlist:"
                        ),
                        " ",
                        course.getWaitlistString()
                    ),
                    prerequisites,
                    corequisites,
                    restrictions,
                    React.createElement(
                        "p",
                        null,
                        course.getDescription()
                    )
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 2, tab: "Course Evaluations" },
                    courseCharts
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 3, tab: "Course Comments" },
                    courseComments
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 4, tab: "Instructor Evaluations" },
                    instructorCharts
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 5, tab: "Instructor Comments" },
                    instructorComments
                )
            );
        }
    });

    function showCourseFactory(course) {
        return function (event) {
            showCourseDetail(course);
        };
    }

    function showCourseDetail(course) {
        var dialog = Bootbox.dialog({
            title: "" + course.getCourseID() + " - " + course.getTitle() + " <br/><small>" + course.getInstructor() + "</small>",
            message: jQuery("<div/>", { id: "course-modal-content" }),
            size: "large",
            onEscape: function () {},
            show: false,
            className: "course-modal-dialog"
        });

        dialog.on("show.bs.modal", function (event) {
            React.render(React.createElement(CourseDetailBody, { course: course }), jQuery("#course-modal-content", event.target)[0]);

            jQuery(event.target).click(function (event) {
                if (jQuery(event.target).hasClass("modal")) Bootbox.hideAll();
            });
        });

        dialog.modal("show");
    }
});