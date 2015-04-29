define(["exports", "module", "react", "reactDnd", "util"], function (exports, module, _react, _reactDnd, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var React = _interopRequire(_react);

    var DragDropMixin = _reactDnd.DragDropMixin;
    var makeClasses = _util.makeClasses;
    module.exports = React.createClass({
        displayName: "event",

        mixins: [DragDropMixin],

        getInitialState: function getInitialState() {
            return {
                dropHovered: false
            };
        },

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

                            return one.getSubject() === two.getSubject() && one.getNumber() === two.getNumber() && one.getSection() !== two.getSection();
                        },

                        enter: function enter(component, event) {
                            component.setState({
                                dropHovered: true
                            });
                        },

                        leave: function leave(component, event) {
                            component.setState({
                                dropHovered: false
                            });
                        }
                    }
                });
            }
        },

        render: function render() {
            var event = this.props.event;
            var eventStart = event.start.format(this.props.timeDisplayFormat);
            var eventEnd = event.end.format(this.props.timeDisplayFormat);

            var classes = {
                "planner-event": true,
                "planner-event-drop-hover": this.state.dropHovered
            };

            if (event.classes !== undefined) {
                for (var i = 0; i < event.classes.length; i++) {
                    classes[event.classes[i]] = true;
                }
            }

            return React.createElement(
                "div",
                _extends({}, this.props, { className: makeClasses(classes)
                }, this.dragSourceFor("plannerEvent"), this.dropTargetFor("plannerEvent")),
                event.title,
                React.createElement("br", null),
                React.createElement(
                    "small",
                    null,
                    "" + eventStart + " - " + eventEnd
                )
            );
        }
    });
});