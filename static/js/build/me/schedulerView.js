define(["exports", "module", "react", "me/planner/planner", "courses/course", "courses/userCourses", "courses/courseDetail", "util"], function (exports, module, _react, _mePlannerPlanner, _coursesCourse, _coursesUserCourses, _coursesCourseDetail, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var React = _interopRequire(_react);

    var Planner = _interopRequire(_mePlannerPlanner);

    var Course = _interopRequire(_coursesCourse);

    var UserCourses = _interopRequire(_coursesUserCourses);

    var showCourseDetail = _coursesCourseDetail.showCourseDetail;
    var eventOverlap = _util.eventOverlap;
    var getHueByIndex = _util.getHueByIndex;
    var hsvToRgb = _util.hsvToRgb;
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

        eventsForCourse: function eventsForCourse(course, color) {
            return course.meetings.map(function (date, i) {
                return {
                    id: "" + course.getCRN() + "-" + i,
                    title: course.getCourseID(),
                    start: date.start,
                    end: date.end,
                    course: course,
                    color: color
                };
            });
        },

        getEvents: function getEvents(callback) {
            var events = [];

            if (this.state.scheduler === undefined) callback(events);else {
                var map = this.state.scheduler.getMap();

                for (var i = 0; i < this.state.courses.length; i++) {
                    var course = this.state.courses[i];
                    var hue = getHueByIndex(i, this.state.courses.length);

                    var _hsvToRgb = hsvToRgb(hue, 1, 0.65);

                    var _hsvToRgb2 = _slicedToArray(_hsvToRgb, 3);

                    var r = _hsvToRgb2[0];
                    var g = _hsvToRgb2[1];
                    var b = _hsvToRgb2[2];

                    var alpha = undefined;
                    if (this.state.alternates.length > 0) {
                        alpha = 0.4;
                    } else {
                        alpha = 1;
                    }

                    var color = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";

                    if (map[course.getCRN()]) events = events.concat(this.eventsForCourse(course, color));
                }

                for (var j = 0; j < this.state.alternates.length; j++) {
                    var alt = this.state.alternates[j];
                    var altEvents = this.eventsForCourse(alt);
                    for (var k = 0; k < altEvents.length; k++) {
                        altEvents[k].color = "green";
                    }
                    events = events.concat(altEvents);
                }

                callback(events);
            }
        },

        onEventClick: function onEventClick(event) {
            showCourseDetail(event.course);
        },

        eventDragStart: function eventDragStart(event) {
            var _this = this;

            event.course.getOtherSections(function (courses) {
                _this.setState({
                    alternates: courses
                });
            });
        },

        eventDrop: function eventDrop(event, delta, revert) {
            var newCourse = undefined;

            var offsetEvent = {
                start: event.start.add(delta._milliseconds, "ms"),
                end: event.end.add(delta._milliseconds, "ms")
            };

            alternateLoop: for (var i = 0; i < this.state.alternates.length; i++) {
                var altMeetings = this.state.alternates[i].getMeetings();

                for (var j = 0; j < altMeetings.length; j++) {
                    var meeting = altMeetings[j];

                    if (eventOverlap(offsetEvent, meeting)) {
                        newCourse = this.state.alternates[i];
                        break alternateLoop;
                    }
                }
            }

            this.setState({
                alternates: []
            });

            if (newCourse !== undefined) {
                this.props.courseDelegate.replaceSection(event.course, newCourse);
            } else {
                revert();
            }
        },

        componentDidUpdate: function componentDidUpdate(nextProps, nextState) {},

        render: function render() {
            return React.createElement(Planner, { events: this.getEvents,
                onEventClick: this.onEventClick });
        }
    });
});

// Update events