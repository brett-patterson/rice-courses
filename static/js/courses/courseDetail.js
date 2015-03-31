define(["exports", "module", "react", "reactBootstrap", "bootbox", "jquery", "util"], function (exports, module, _react, _reactBootstrap, _bootbox, _jquery, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    module.exports = showCourseDetail;

    var React = _interopRequire(_react);

    var TabbedArea = _reactBootstrap.TabbedArea;
    var TabPane = _reactBootstrap.TabPane;

    var Bootbox = _interopRequire(_bootbox);

    var jQuery = _interopRequire(_jquery);

    var makeClasses = _util.makeClasses;

    var CourseDetailBody = React.createClass({
        displayName: "CourseDetailBody",

        render: function render() {
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
                            "Meetings:"
                        ),
                        " ",
                        course.getMeetings(),
                        " "
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
                React.createElement(TabPane, { eventKey: 2, tab: "Course Evaluations" }),
                React.createElement(TabPane, { eventKey: 3, tab: "Course Comments" }),
                React.createElement(TabPane, { eventKey: 4, tab: "Instructor Evaluations" }),
                React.createElement(TabPane, { eventKey: 5, tab: "Instructor Comments" })
            );
        }
    });

    function showCourseDetail(course) {
        var dialog = Bootbox.dialog({
            title: "" + course.getCourseID() + " - " + course.getTitle() + " <br/><small>" + course.getInstructor() + "</small>",
            message: jQuery("<div/>", { "class": "course-modal-content" }),
            size: "large",
            onEscape: function () {},
            show: false,
            className: "course-modal-dialog"
        });

        dialog.on("show.bs.modal", function (event) {
            React.render(React.createElement(CourseDetailBody, { course: course }), jQuery(".course-modal-content", event.target)[0]);
        });

        dialog.modal("show");
    }
});