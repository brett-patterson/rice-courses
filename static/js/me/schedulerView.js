define(["exports", "module", "react", "jquery", "fullcalendar", "courses/course", "courses/userCourses", "courses/courseDetail"], function (exports, module, _react, _jquery, _fullcalendar, _coursesCourse, _coursesUserCourses, _coursesCourseDetail) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var jQuery = _interopRequire(_jquery);

    var FullCalendar = _interopRequire(_fullcalendar);

    var Course = _interopRequire(_coursesCourse);

    var UserCourses = _interopRequire(_coursesUserCourses);

    var showCourseDetail = _coursesCourseDetail.showCourseDetail;
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
            return course.meetings.map(function (date) {
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
                                altEvents[k].color = "green";
                            }
                            events = events.concat(altEvents);
                        }

                        callback(events);
                    }
                },

                eventClick: function (event, jsEvent, view) {
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
                    var start = event.start.add(delta._milliseconds, "ms");
                    var end = event.end.add(delta._milliseconds, "ms");
                    var newCourse = undefined;

                    alternateLoop: for (var i = 0; i < _this.state.alternates.length; i++) {
                        var altMeetings = _this.state.alternates[i].getMeetings();

                        for (var j = 0; j < altMeetings.length; j++) {
                            var meeting = altMeetings[j];

                            if (start.isBetween(meeting.start, meeting.end) || end.isBetween(meeting.start, meeting.end)) {
                                newCourse = _this.state.alternates[i];
                                break alternateLoop;
                            }
                        }
                    }

                    if (newCourse !== undefined) {
                        var index = _this.state.courses.indexOf(event.course);
                        UserCourses.remove(event.course);
                        UserCourses.add(newCourse);
                        _this.setState(React.addons.update(_this.state, {
                            alternates: {
                                $set: []
                            },
                            courses: {
                                $splice: [[index, 1, newCourse]]
                            }
                        }));
                    } else {
                        _this.setState({
                            alternates: []
                        });
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