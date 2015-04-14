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
            });
        },

        renderInfo: function renderInfo() {
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

            return React.createElement(
                "div",
                null,
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
            );
        },

        renderCourseCharts: function renderCourseCharts() {
            var _this = this;

            if (this.state.courseQuestions === undefined) {
                return "Loading...";
            } else if (this.state.courseQuestions.length === 0) {
                return "No evaluations found";
            }

            return this.state.courseQuestions.map(function (question, i) {
                return React.createElement(EvaluationChart, { key: "courseEvalChart" + i,
                    title: question.text,
                    data: question.choices,
                    type: _this.state.chartType });
            });
        },

        renderCourseComments: function renderCourseComments() {
            if (this.state.courseComments === undefined) {
                return "Loading...";
            } else if (this.state.courseComments.length === 0) {
                return "No comments found";
            }

            return this.state.courseComments.map(function (comment, i) {
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
        },

        renderInstructorCharts: function renderInstructorCharts() {
            var _this = this;

            if (this.state.instructorQuestions === undefined) {
                return "Loading...";
            } else if (this.state.instructorQuestions.length === 0) {
                return "No evaluations found";
            }

            return this.state.instructorQuestions.map(function (question, i) {
                return React.createElement(EvaluationChart, { key: "instructorEvalChart" + i,
                    title: question.text,
                    data: question.choices,
                    type: _this.state.chartType });
            });
        },

        renderInstructorComments: function renderInstructorComments() {
            if (this.state.instructorComments === undefined) {
                return "Loading...";
            } else if (this.state.instructorComments.length === 0) {
                return "No comments found";
            }

            return this.state.instructorComments.map(function (comment, i) {
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
        },

        render: function render() {
            return React.createElement(
                TabbedArea,
                { defaultActiveKey: 1, animation: false },
                React.createElement(
                    TabPane,
                    { eventKey: 1, tab: "Info" },
                    this.renderInfo()
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 2, tab: "Course Evaluations" },
                    this.renderCourseCharts()
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 3, tab: "Course Comments" },
                    this.renderCourseComments()
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 4, tab: "Instructor Evaluations" },
                    this.renderInstructorCharts()
                ),
                React.createElement(
                    TabPane,
                    { eventKey: 5, tab: "Instructor Comments" },
                    this.renderInstructorComments()
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