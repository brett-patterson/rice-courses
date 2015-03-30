define(["exports", "module", "react", "courses/filters", "courses/filterWidget"], function (exports, module, _react, _coursesFilters, _coursesFilterWidget) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var FILTERS = _coursesFilters.FILTERS;

    var FilterWidget = _interopRequire(_coursesFilterWidget);

    module.exports = React.createClass({
        displayName: "courseList",

        render: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(FilterWidget, { filters: FILTERS })
            );
        }
    });
});