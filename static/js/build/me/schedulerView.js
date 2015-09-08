define(["exports", "module", "react", "me/planner/planner", "courses/course", "me/scheduler", "courses/userCourses", "courses/detail/courseDetail", "util"], function (exports, module, _react, _mePlannerPlanner, _coursesCourse, _meScheduler, _coursesUserCourses, _coursesDetailCourseDetail, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var React = _interopRequire(_react);

    var Planner = _interopRequire(_mePlannerPlanner);

    var Course = _interopRequire(_coursesCourse);

    var Scheduler = _interopRequire(_meScheduler);

    var UserCourses = _interopRequire(_coursesUserCourses);

    var showCourseDetail = _coursesDetailCourseDetail.showCourseDetail;
    var eventOverlap = _util.eventOverlap;
    var getHueByIndex = _util.getHueByIndex;
    var hsvToRgb = _util.hsvToRgb;
    var propTypeHas = _util.propTypeHas;

    var DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    module.exports = React.createClass({
        displayName: "schedulerView",

        propTypes: {
            scheduler: React.PropTypes.instanceOf(Scheduler),
            courses: React.PropTypes.array,
            courseDelegate: propTypeHas(["replaceSection"])
        },

        getDefaultProps: function getDefaultProps() {
            return {
                courses: []
            };
        },

        getInitialState: function getInitialState() {
            return {
                scheduler: this.props.scheduler,
                courses: this.props.courses,
                alternates: []
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                scheduler: nextProps.scheduler,
                courses: nextProps.courses
            });
        },

        eventsForCourse: function eventsForCourse(course, color, classes) {
            return course.meetings.map(function (date, i) {
                return {
                    id: "" + course.getCRN() + "-" + i,
                    title: course.getCourseID(),
                    note: course.getLocation(),
                    start: date.start,
                    end: date.end,
                    course: course,
                    color: color,
                    classes: classes
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

                    var alpha = undefined,
                        classes = undefined;
                    if (this.state.alternates.length > 0) {
                        alpha = 0.25;
                        classes = ["course-event-muted"];
                    } else {
                        alpha = 1;
                        classes = [];
                    }

                    var color = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";

                    if (map[course.getCRN()]) events = events.concat(this.eventsForCourse(course, color, classes));
                }

                for (var j = 0; j < this.state.alternates.length; j++) {
                    var alt = this.state.alternates[j];
                    var altEvents = this.eventsForCourse(alt);
                    for (var k = 0; k < altEvents.length; k++) {
                        altEvents[k].classes = ["course-event-alternate"];
                    }
                    events = events.concat(altEvents);
                }

                callback(events);
            }
        },

        getDays: function getDays() {
            var days = [];

            if (this.state.scheduler === undefined) {
                return days;
            }var map = this.state.scheduler.getMap();

            for (var i = 0; i < this.state.courses.length; i++) {
                var course = this.state.courses[i];
                if (map[course.getCRN()]) {
                    for (var j = 0; j < course.meetings.length; j++) {
                        var day = course.meetings[j].start.format("dddd");
                        if (days.indexOf(day) < 0) {
                            days.push(day);
                        }
                    }
                }
            }

            days.sort(function (a, b) {
                return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
            });

            return days;
        },

        eventClick: function eventClick(event) {
            showCourseDetail(event.course);
        },

        eventDragStart: function eventDragStart(event) {
            var _this = this;

            event.course.getOtherSections(function (courses) {
                courses = courses.filter(function (course) {
                    return _this.props.scheduler === undefined || _this.props.scheduler !== undefined && !_this.props.scheduler.getMap()[course.getCRN()];
                });

                _this.setState({
                    alternates: courses
                });
            });
        },

        eventDragCancel: function eventDragCancel(event) {
            this.setState({
                alternates: []
            });
        },

        eventDrop: function eventDrop(oldEvent, newEvent) {
            this.setState({
                alternates: []
            });

            this.props.courseDelegate.replaceSection(oldEvent.course, newEvent.course);
        },

        componentDidUpdate: function componentDidUpdate(nextProps, nextState) {
            this.refs.planner.updateEvents();
        },

        render: function render() {
            return React.createElement(Planner, { ref: "planner", eventSource: this.getEvents,
                days: this.getDays(),
                onEventClick: this.eventClick,
                onEventDragStart: this.eventDragStart,
                onEventDragCancel: this.eventDragCancel,
                onEventDrop: this.eventDrop });
        }
    });
});