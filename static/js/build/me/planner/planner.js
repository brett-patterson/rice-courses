define(["exports", "module", "react"], function (exports, module, _react) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    module.exports = React.createClass({
        displayName: "planner",

        getDefaultProps: function getDefaultProps() {
            return {
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                startHour: 8,
                endHour: 20,
                timeWidthPercent: 3,
                slotHeight: 25,
                eventInsetPercent: 0,
                timeDisplayFormat: "hh:mm A",
                onEventClick: function () {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                events: []
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.fetchEvents(nextProps.events);
        },

        fetchEvents: function fetchEvents(source) {
            var _this = this;

            if (source === undefined) {
                this.setState({
                    events: []
                });
            } else if (typeof source === "function") {
                source(function (events) {
                    _this.setState({
                        events: events
                    });
                });
            } else {
                this.setState({
                    events: source
                });
            }
        },

        militaryTo12Hour: function militaryTo12Hour(military) {
            var twelveHour = military % 12;

            if (twelveHour === 0) {
                twelveHour = 12;
            }

            return twelveHour;
        },

        getSlotWidthPercent: function getSlotWidthPercent() {
            return (100 - this.props.timeWidthPercent) / this.props.days.length;
        },

        getHeightForEvent: function getHeightForEvent(event) {
            var minutesElapsed = (event.end - event.start) / 60000;

            return minutesElapsed / 30 * this.props.slotHeight;
        },

        getLeftPercentForEvent: function getLeftPercentForEvent(event) {
            var index = this.props.days.indexOf(event.start.format("dddd"));

            return this.props.timeWidthPercent + index * this.getSlotWidthPercent() + this.props.eventInsetPercent;
        },

        getTopForEvent: function getTopForEvent(event) {
            return (event.start.hour() - this.props.startHour + 1) * 2 * this.props.slotHeight;
        },

        onEventClickHandler: function onEventClickHandler(event) {
            var _this = this;

            return function (clickEvent) {
                _this.props.onEventClick(event, clickEvent);
            };
        },

        renderEvents: function renderEvents() {
            var _this = this;

            var eventWidth = this.getSlotWidthPercent() - 2 * this.props.eventInsetPercent;

            return this.state.events.map(function (event) {
                var eventStyle = {
                    backgroundColor: event.color,
                    height: _this.getHeightForEvent(event),
                    left: "" + _this.getLeftPercentForEvent(event) + "%",
                    top: _this.getTopForEvent(event),
                    width: "" + eventWidth + "%"
                };

                var eventStart = event.start.format(_this.props.timeDisplayFormat);
                var eventEnd = event.end.format(_this.props.timeDisplayFormat);

                return React.createElement(
                    "div",
                    { key: event.id, className: "planner-event",
                        style: eventStyle,
                        onClick: _this.onEventClickHandler(event) },
                    event.title,
                    "" + eventStart + " - " + eventEnd
                );
            });
        },

        renderHeaderRows: function renderHeaderRows() {
            var _this = this;

            var headers = this.props.days.map(function (day, i) {
                return React.createElement(
                    "th",
                    { width: "" + _this.getSlotWidthPercent() + "%",
                        height: _this.props.slotHeight,
                        key: "plannerHead" + i },
                    day
                );
            });

            return React.createElement(
                "tr",
                null,
                React.createElement("th", null),
                headers
            );
        },

        renderFillerRows: function renderFillerRows() {
            var _this = this;

            var major = arguments[0] === undefined ? false : arguments[0];

            var rowClass = major ? "planner-slot-major" : "planner-slot-minor";
            return this.props.days.map(function (day, i) {
                return React.createElement("td", { key: "filler" + i,
                    height: _this.props.slotHeight, className: rowClass });
            });
        },

        renderPlannerRows: function renderPlannerRows() {
            var rows = [];

            for (var i = this.props.startHour; i <= this.props.endHour; i++) {
                var amPM = i / 12 === 0 ? "am" : "pm";
                rows.push(React.createElement(
                    "tr",
                    { key: "plannerTime" + i + "-1" },
                    React.createElement(
                        "td",
                        { className: "planner-axis-time planner-slot-major",
                            width: "" + this.props.timeWidthPercent + "%",
                            height: this.props.slotHeight },
                        this.militaryTo12Hour(i),
                        React.createElement(
                            "span",
                            { className: "planner-am-pm" },
                            amPM
                        )
                    ),
                    this.renderFillerRows(true)
                ), React.createElement(
                    "tr",
                    { key: "plannerTime" + i + "-2" },
                    React.createElement("td", { className: "planner-axis-time planner-slot-minor",
                        width: "" + this.props.timeWidthPercent + "%",
                        height: this.props.slotHeight }),
                    this.renderFillerRows()
                ));
            }

            return rows;
        },

        render: function render() {
            return React.createElement(
                "div",
                { className: "planner" },
                React.createElement(
                    "div",
                    { className: "planner-event-overlay" },
                    this.renderEvents()
                ),
                React.createElement(
                    "table",
                    null,
                    React.createElement(
                        "thead",
                        null,
                        this.renderHeaderRows()
                    ),
                    React.createElement(
                        "tbody",
                        null,
                        this.renderPlannerRows()
                    )
                )
            );
        }
    });
});