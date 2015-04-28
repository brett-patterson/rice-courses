define(["exports", "module", "react", "reactDnd"], function (exports, module, _react, _reactDnd) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var React = _interopRequire(_react);

    var DragDropMixin = _reactDnd.DragDropMixin;
    module.exports = React.createClass({
        displayName: "event",

        mixins: [DragDropMixin],

        statics: {
            configureDragDrop: function configureDragDrop(register) {
                register("plannerEvent", {
                    dragSource: {
                        beginDrag: function beginDrag(component) {
                            var event = component.props.event;
                            component.props.planner.onEventDragStart(event);
                            return {
                                item: event
                            };
                        },

                        endDrag: function endDrag(component, dropEffect) {
                            var event = component.props.event;
                            if (dropEffect === null) {
                                component.props.planner.onEventDragCancel(event);
                            }
                        }
                    },

                    dropTarget: {
                        acceptDrop: function acceptDrop(component, event) {
                            component.props.planner.onEventDrop(event, component.props.event);
                        },

                        canDrop: function canDrop(component, event) {
                            var one = component.props.event.course;
                            var two = event.course;

                            return one.getSubject() === two.getSubject() && one.getNumber() === two.getNumber();
                        }
                    }
                });
            }
        },

        render: function render() {
            var event = this.props.event;
            var eventStart = event.start.format(this.props.timeDisplayFormat);
            var eventEnd = event.end.format(this.props.timeDisplayFormat);

            return React.createElement(
                "div",
                _extends({}, this.props, { className: "planner-event"
                }, this.dragSourceFor("plannerEvent"), this.dropTargetFor("plannerEvent")),
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