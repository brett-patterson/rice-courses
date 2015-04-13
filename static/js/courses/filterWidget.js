define(["exports", "module", "react", "courses/filterButton", "courses/filterInput", "util"], function (exports, module, _react, _coursesFilterButton, _coursesFilterInput, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var FilterButton = _interopRequire(_coursesFilterButton);

    var FilterInput = _interopRequire(_coursesFilterInput);

    var getHueByIndex = _util.getHueByIndex;
    module.exports = React.createClass({
        displayName: "filterWidget",

        getDefaultProps: function getDefaultProps() {
            return {
                key: ":"
            };
        },

        getInitialState: function getInitialState() {
            return {
                outline: "none",
                placeholder: "Add Filters...",
                keywords: {},
                text: "",
                currentFilters: []
            };
        },

        componentWillMount: function componentWillMount() {
            var keywords = {};
            for (var i = 0; i < this.props.filters.length; i++) {
                var filter = this.props.filters[i];
                var filterKeywords = filter.getKeywords();

                for (var j = 0; j < filterKeywords.length; j++) {
                    keywords[filterKeywords[j].toLowerCase()] = filter;
                }
            }

            this.setState({
                keywords: keywords
            });
        },

        onFocus: function onFocus() {
            this.setState({
                outline: "lightblue solid 1px"
            });
        },

        onBlur: function onBlur() {
            this.setState({
                outline: "none"
            });
        },

        onChange: function onChange(event) {
            var _this = this;

            var text = event.target.value;

            this.setState({ text: text }, function () {
                var index = text.indexOf(_this.props.key);

                if (index > -1) {
                    (function () {
                        var field = text.substring(0, index).toLowerCase();
                        var value = text.substring(index + 1);
                        var filter = _this.state.keywords[field];

                        if (field.length > 0 && filter !== undefined) {
                            _this.setState({
                                text: ""
                            }, function () {
                                _this.addFilter(filter, value);
                            });
                        }
                    })();
                }
            });
        },

        onKeyDown: function onKeyDown(event) {
            var filters = this.props.manager.getFilters();

            if (event.keyCode === 8 && filters.length > 0 && this.state.text.length === 0) {
                this.removeFilter(this.state.currentFilters[filters.length - 1]);
            }
        },

        widgetClicked: function widgetClicked() {
            React.findDOMNode(this.refs.input).focus();
        },

        addFilter: function addFilter(filter, value) {
            var _this = this;

            this.props.manager.addFilter(filter, value);

            this.setState({
                currentFilters: this.props.manager.getFilters()
            }, function () {
                var index = _this.props.manager.getFilters().length - 1;
                var id = "filter-" + (index + 1) + "-" + index;
                React.findDOMNode(_this.refs[id].refs.input).focus();
            });
        },

        removeFilter: function removeFilter(filter) {
            this.props.manager.removeFilter(filter);

            this.setState({
                currentFilters: this.props.manager.getFilters()
            });
        },

        updateFilter: function updateFilter(filter, value) {
            this.props.manager.updateFilter(filter, value);
        },

        render: function render() {
            var _this = this;

            var filterButtons = this.props.filters.map(function (filter, index) {
                return React.createElement(FilterButton, { filter: filter,
                    hue: getHueByIndex(index, _this.props.filters.length),
                    key: "filterBtn" + index,
                    delegate: _this });
            });

            var widgetStyle = {
                outline: this.state.outline
            };

            var filterInputs = this.state.currentFilters.map(function (filter, index) {
                var id = "filter-" + _this.state.currentFilters.length + "-" + index;
                return React.createElement(FilterInput, { filter: filter, key: id, ref: id,
                    delegate: _this });
            });

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "course-filters" },
                    filterButtons
                ),
                React.createElement(
                    "div",
                    { className: "filter-widget", style: widgetStyle,
                        onClick: this.widgetClicked },
                    filterInputs,
                    React.createElement("input", { ref: "input", type: "text", className: "filter-input",
                        placeholder: this.state.placeholder,
                        value: this.state.text,
                        onFocus: this.onFocus, onBlur: this.onBlur,
                        onChange: this.onChange, onKeyDown: this.onKeyDown })
                )
            );
        }
    });
});