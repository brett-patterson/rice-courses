define(["exports", "module", "react", "jquery"], function (exports, module, _react, _jquery) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var jQuery = _interopRequire(_jquery);

    module.exports = React.createClass({
        displayName: "filterInput",

        getInitialState: function getInitialState() {
            return {
                value: this.props.filter.getValue()
            };
        },

        remove: function remove() {
            this.props.delegate.removeFilter(this.props.filter);
        },

        inputKeyDown: function inputKeyDown(event) {
            if (event.keyCode === 13) {
                React.findDOMNode(this.props.delegate.refs.input).focus();
            } else if (event.keyCode === 8 && this.state.value === "") {
                this.remove();
                React.findDOMNode(this.props.delegate.refs.input).focus();
            }
        },

        inputChanged: function inputChanged(event) {
            var _this = this;

            this.setState({
                value: event.target.value
            }, function () {
                _this.props.delegate.updateFilter(_this.props.filter, _this.state.value);
            });
        },

        onInputClick: function onInputClick(event) {
            // Prevent the event from bubbling down to the FilterWidget, which
            // takes focus on click
            event.stopPropagation();
        },

        render: function render() {
            var virtual = jQuery("<span/>", {
                text: this.state.value
            }).hide().appendTo(document.body);

            var filter = this.props.filter;
            var style = {
                marginLeft: 5,
                width: virtual.width() + 10
            };

            virtual.remove();

            return React.createElement(
                "div",
                { className: "filter-view" },
                React.createElement(
                    "span",
                    { className: "filter-view-name" },
                    "" + filter.getName()
                ),
                React.createElement("input", { ref: "input", className: "filter-view-input", style: style,
                    onKeyDown: this.inputKeyDown,
                    onChange: this.inputChanged,
                    value: this.state.value,
                    onClick: this.onInputClick }),
                React.createElement(
                    "a",
                    { onClick: this.remove },
                    React.createElement("span", { className: "glyphicon glyphicon-remove" })
                )
            );
        }
    });
});