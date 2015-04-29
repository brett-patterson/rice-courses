define(["exports", "module", "react", "courses/filter/filterButton", "courses/filter/filterInput", "courses/filter/filterManager", "util"], function (exports, module, _react, _coursesFilterFilterButton, _coursesFilterFilterInput, _coursesFilterFilterManager, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var FilterButton = _interopRequire(_coursesFilterFilterButton);

    var FilterInput = _interopRequire(_coursesFilterFilterInput);

    var FilterManager = _interopRequire(_coursesFilterFilterManager);

    var getHueByIndex = _util.getHueByIndex;
    module.exports = React.createClass({
        displayName: "filterWidget",

        propTypes: {
            key: React.PropTypes.string,
            filters: React.PropTypes.array,
            manager: React.PropTypes.instanceOf(FilterManager).isRequired
        },

        getDefaultProps: function getDefaultProps() {
            return {
                key: ":",
                filters: []
            };
        },

        getInitialState: function getInitialState() {
            return {
                outline: "none",
                placeholder: "Add Filters...",
                keywords: {},
                text: "",
                currentFilters: this.props.manager.getFilters()
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
                                filter.setValue(value);
                                _this.addFilter(filter);
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

            filter.setValue(value);
            this.props.manager.addFilter(filter);

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

        renderFilterButtons: function renderFilterButtons() {
            var _this = this;

            return this.props.filters.map(function (filter, index) {
                return React.createElement(FilterButton, { filter: filter,
                    hue: getHueByIndex(index, _this.props.filters.length),
                    key: "filterBtn" + index,
                    delegate: _this });
            });
        },

        renderFilterInputs: function renderFilterInputs() {
            var _this = this;

            return this.state.currentFilters.map(function (filter, index) {
                var id = "filter-" + _this.state.currentFilters.length + "-" + index;
                return React.createElement(FilterInput, { filter: filter, key: id, ref: id,
                    delegate: _this });
            });
        },

        render: function render() {
            var widgetStyle = {
                outline: this.state.outline
            };

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "course-filters" },
                    this.renderFilterButtons()
                ),
                React.createElement(
                    "div",
                    { className: "filter-widget", style: widgetStyle,
                        onClick: this.widgetClicked },
                    this.renderFilterInputs(),
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