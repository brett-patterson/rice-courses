define(["exports", "module", "react", "courses/filter/filterManager", "courses/filter/filterWidget", "courses/filter/courseFilter", "courses/courseList", "util"], function (exports, module, _react, _coursesFilterFilterManager, _coursesFilterFilterWidget, _coursesFilterCourseFilter, _coursesCourseList, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var FilterManager = _interopRequire(_coursesFilterFilterManager);

    var FilterWidget = _interopRequire(_coursesFilterFilterWidget);

    var CourseFilter = _interopRequire(_coursesFilterCourseFilter);

    var CourseList = _interopRequire(_coursesCourseList);

    var ajaxCSRF = _util.ajaxCSRF;

    var FILTERS = [new CourseFilter("crn", "CRN"), new CourseFilter("courseID", "Course", ["course"], "", function (callback) {
        ajaxCSRF({
            url: "/courses/api/subjects/",
            method: "POST",
            dataType: "json"
        }).done(function (result) {
            callback(result);
        });
    }), new CourseFilter("title", "Title"), new CourseFilter("instructor", "Instructor"), new CourseFilter("meetings", "Meetings", ["meeting"]), new CourseFilter("credits", "Credits"), new CourseFilter("distribution", "Distribution", ["dist"], "")];

    module.exports = React.createClass({
        displayName: "courses",

        getInitialState: function getInitialState() {
            return {
                manager: new FilterManager(this.onFiltersChanged)
            };
        },

        onFiltersChanged: function onFiltersChanged() {
            if (this.refs && this.refs.courseList) {
                this.refs.courseList.fetchCourses();
            }
        },

        render: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(FilterWidget, { manager: this.state.manager, filters: FILTERS }),
                React.createElement(CourseList, { ref: "courseList", filterManager: this.state.manager })
            );
        }
    });
});