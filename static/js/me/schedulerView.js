define(["exports", "module", "react", "jquery", "fullcalendar", "moment", "courses/courseDetail"], function (exports, module, _react, _jquery, _fullcalendar, _moment, _coursesCourseDetail) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var jQuery = _interopRequire(_jquery);

    var FullCalendar = _interopRequire(_fullcalendar);

    var Moment = _interopRequire(_moment);

    var showCourseDetail = _coursesCourseDetail.showCourseDetail;

    var DAY_MAP = {
        M: "01",
        T: "02",
        W: "03",
        R: "04",
        F: "05"
    };

    module.exports = React.createClass({
        displayName: "schedulerView",

        getInitialState: function getInitialState() {
            return {
                scheduler: this.props.scheduler,
                courses: this.props.courses || []
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                scheduler: nextProps.scheduler,
                courses: nextProps.courses
            });
        },

        datesForCourse: function datesForCourse(course) {
            var dates = [];

            var meetingsPattern = /([A-Z,\s]+)([0-9,\s]+)-([0-9,\s]+)/;
            var matches = meetingsPattern.exec(course.getMeetings());

            var days = jQuery.trim(matches[1]).split(", ");
            var starts = jQuery.trim(matches[2]).split(", ");
            var ends = jQuery.trim(matches[3]).split(", ");

            for (var i = 0; i < days.length; i++) {
                var dayString = days[i],
                    start = starts[i],
                    end = ends[i];

                for (var j = 0; j < dayString.length; j++) {
                    var day = DAY_MAP[dayString[j]];
                    var format = "YYYY-MM-DD HHmm";

                    dates.push({
                        start: Moment("2007-01-" + day + " " + starts[i], format),
                        end: Moment("2007-01-" + day + " " + ends[i], format)
                    });
                }
            }

            return dates;
        },

        eventsForCourse: function eventsForCourse(course) {
            return this.datesForCourse(course).map(function (date) {
                return {
                    id: course.getCRN(),
                    title: course.getCourseID(),
                    start: date.start,
                    end: date.end,
                    course: course
                };
            });
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            jQuery(React.findDOMNode(this.refs.calendar)).fullCalendar({
                height: "auto",
                defaultView: "agendaWeek",
                defaultDate: new Date(2007, 0, 1).toISOString(),
                header: false,
                weekends: false,
                editable: false,
                columnFormat: "dddd",
                allDaySlot: false,
                minTime: "08:00:00",
                maxTime: "21:00:00",
                timeFormat: "hh:mm A",

                events: function (start, end, timezone, callback) {
                    var events = [];

                    if (_this.state.scheduler === undefined) callback(events);else {
                        var map = _this.state.scheduler.getMap();

                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _this.state.courses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var course = _step.value;

                                if (map[course.getCRN()]) events = events.concat(_this.eventsForCourse(course));
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        callback(events);
                    }
                },

                eventRender: function (event, element) {},

                eventClick: function (event, jsEvent, view) {
                    showCourseDetail(event.course);
                }

            }).fullCalendar("refetchEvents");
        },

        componentDidUpdate: function componentDidUpdate(nextProps, nextState) {
            jQuery(React.findDOMNode(this.refs.calendar)).fullCalendar("refetchEvents");
        },

        render: function render() {
            return React.createElement("div", { ref: "calendar" });
        }
    });
});

// attachContextMenu(event.id, element);