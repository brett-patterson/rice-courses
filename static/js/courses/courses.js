define(["exports", "module", "react", "courses/filters", "courses/filterManager", "courses/filterWidget", "courses/courseList"], function (exports, module, _react, _coursesFilters, _coursesFilterManager, _coursesFilterWidget, _coursesCourseList) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var FILTERS = _coursesFilters.FILTERS;

    var FilterManager = _interopRequire(_coursesFilterManager);

    var FilterWidget = _interopRequire(_coursesFilterWidget);

    var CourseList = _interopRequire(_coursesCourseList);

    module.exports = React.createClass({
        displayName: "courses",

        getInitialState: function getInitialState() {
            return {
                manager: new FilterManager(this.onFiltersChanged)
            };
        },

        filter: function filter(objects) {
            return this.state.manager.filter(objects);
        },

        onFiltersChanged: function onFiltersChanged() {
            this.refs.courseList.updateFilteredCourses();
        },

        render: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(FilterWidget, { manager: this.state.manager, filters: FILTERS }),
                React.createElement(CourseList, { ref: "courseList", filterDelegate: this })
            );
        }
    });
});