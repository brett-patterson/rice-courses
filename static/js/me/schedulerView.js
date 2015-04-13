define(["exports", "module", "react", "jquery", "fullcalendar", "courses/course", "courses/userCourses", "courses/courseDetail", "util"], function (exports, module, _react, _jquery, _fullcalendar, _coursesCourse, _coursesUserCourses, _coursesCourseDetail, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var jQuery = _interopRequire(_jquery);

    var FullCalendar = _interopRequire(_fullcalendar);

    var Course = _interopRequire(_coursesCourse);

    var UserCourses = _interopRequire(_coursesUserCourses);

    var showCourseDetail = _coursesCourseDetail.showCourseDetail;
    var eventOverlap = _util.eventOverlap;
    var getHueByIndex = _util.getHueByIndex;
    var hsvToHex = _util.hsvToHex;
    module.exports = React.createClass({
        displayName: "schedulerView",

        getInitialState: function getInitialState() {
            return {
                scheduler: this.props.scheduler,
                courses: this.props.courses || [],
                alternates: []
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                scheduler: nextProps.scheduler,
                courses: nextProps.courses
            });
        },

        eventsForCourse: function eventsForCourse(course) {
            var index = this.state.courses.indexOf(course);
            var hue = getHueByIndex(index, this.state.courses.length);
            var color = hsvToHex(hue, 1, 0.65);

            return course.meetings.map(function (date) {
                return {
                    id: course.getCRN(),
                    title: course.getCourseID(),
                    start: date.start,
                    end: date.end,
                    course: course,
                    color: color
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
                eventStartEditable: true,

                events: function (start, end, timezone, callback) {
                    var events = [];

                    if (_this.state.scheduler === undefined) callback(events);else {
                        var map = _this.state.scheduler.getMap();

                        for (var i = 0; i < _this.state.courses.length; i++) {
                            var course = _this.state.courses[i];

                            if (map[course.getCRN()]) events = events.concat(_this.eventsForCourse(course));
                        }

                        for (var j = 0; j < _this.state.alternates.length; j++) {
                            var alt = _this.state.alternates[j];
                            var altEvents = _this.eventsForCourse(alt);
                            for (var k = 0; k < altEvents.length; k++) {
                                altEvents[k].color = "rgba(28, 158, 37, .75)";
                            }
                            events = events.concat(altEvents);
                        }

                        callback(events);
                    }
                },

                eventClick: function (event) {
                    showCourseDetail(event.course);
                },

                eventDragStart: function (event) {
                    event.course.getOtherSections(function (courses) {
                        _this.setState({
                            alternates: courses
                        });
                    });
                },

                eventDrop: function (event, delta, revert) {
                    var newCourse = undefined;

                    var offsetEvent = {
                        start: event.start.add(delta._milliseconds, "ms"),
                        end: event.end.add(delta._milliseconds, "ms")
                    };

                    alternateLoop: for (var i = 0; i < _this.state.alternates.length; i++) {
                        var altMeetings = _this.state.alternates[i].getMeetings();

                        for (var j = 0; j < altMeetings.length; j++) {
                            var meeting = altMeetings[j];

                            if (eventOverlap(offsetEvent, meeting)) {
                                newCourse = _this.state.alternates[i];
                                break alternateLoop;
                            }
                        }
                    }

                    _this.setState({
                        alternates: []
                    });

                    if (newCourse !== undefined) {
                        _this.props.courseDelegate.replaceSection(event.course, newCourse);
                    } else {
                        revert();
                    }
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