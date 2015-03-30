define(["exports", "module", "react", "jquery"], function (exports, module, _react, _jquery) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var jQuery = _interopRequire(_jquery);

    module.exports = React.createClass({
        displayName: "filterInput",

        removeClicked: function removeClicked() {
            this.props.delegate.removeFilter(this.props.filter);
        },

        inputKeyDown: function inputKeyDown(event) {
            if (event.keyCode === 13) {
                React.findDOMNode(this.props.delegate.refs.input).focus();
            } else if (event.keyCode === 8 && React.findDOMNode(this.refs.input).value === "") {
                this.props.delegate.removeFilter(this.props.filter);
                React.findDOMNode(this.props.delegate.refs.input).focus();
            }
        },

        render: function render() {
            var filter = this.props.filter;

            return React.createElement(
                "span",
                { className: "filter-view" },
                "" + filter.getName() + ": ",
                React.createElement("input", { ref: "input", className: "filter-view-input",
                    onKeyDown: this.inputKeyDown }),
                React.createElement(
                    "a",
                    { onClick: this.removeClicked },
                    React.createElement("span", { className: "glyphicon glyphicon-remove" })
                )
            );
        }
    });
});