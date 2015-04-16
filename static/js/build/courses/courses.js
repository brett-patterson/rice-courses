define(["exports", "module", "react", "courses/filterManager", "courses/filterWidget", "courses/courseFilter", "courses/courseList", "util"], function (exports, module, _react, _coursesFilterManager, _coursesFilterWidget, _coursesCourseFilter, _coursesCourseList, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var React = _interopRequire(_react);

    var FilterManager = _interopRequire(_coursesFilterManager);

    var FilterWidget = _interopRequire(_coursesFilterWidget);

    var CourseFilter = _interopRequire(_coursesCourseFilter);

    var CourseList = _interopRequire(_coursesCourseList);

    var ajaxCSRF = _util.ajaxCSRF;

    var FILTERS = [new CourseFilter("crn", "CRN"), new CourseFilter("courseID", "Course", ["course"], "", CourseFilter.contains, function (callback) {
        ajaxCSRF({
            url: "/courses/api/subjects/",
            method: "POST",
            dataType: "json"
        }).done(function (result) {
            callback(result);
        });
    }), new CourseFilter("title", "Title"), new CourseFilter("instructor", "Instructor"), new CourseFilter("meetings", "Meetings", ["meeting"]), new CourseFilter("credits", "Credits"), new CourseFilter("distribution", "Distribution", ["dist"], "", function (one, two) {
        var _one$split = one.split(" ");

        var _one$split2 = _slicedToArray(_one$split, 2);

        var roman = _one$split2[0];
        var integer = _one$split2[1];

        return roman.toLowerCase() === two.toLowerCase() || integer.toLowerCase() == two.toLowerCase();
    })];

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
            if (this.refs && this.refs.courseList) {
                this.refs.courseList.updateFilteredCourses();
            }
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