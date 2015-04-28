define(["exports", "module", "react", "reactDnd"], function (exports, module, _react, _reactDnd) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var React = _interopRequire(_react);

    var DragDropMixin = _reactDnd.DragDropMixin;
    module.exports = React.createClass({
        displayName: "event",

        render: function render() {
            var event = this.props.event;
            var eventStart = event.start.format(this.props.timeDisplayFormat);
            var eventEnd = event.end.format(this.props.timeDisplayFormat);

            return React.createElement(
                "div",
                _extends({}, this.props, { className: "planner-event" }),
                React.createElement(
                    "small",
                    null,
                    "" + eventStart + " - " + eventEnd
                ),
                React.createElement("br", null),
                event.title
            );
        }
    });
});