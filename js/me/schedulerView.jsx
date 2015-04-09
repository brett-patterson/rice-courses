import React from 'react';
import jQuery from 'jquery';
import FullCalendar from 'fullcalendar';

import Course from 'courses/course';
import UserCourses from 'courses/userCourses';
import {showCourseDetail} from 'courses/courseDetail';


export default React.createClass({
    getInitialState() {
        return {
            scheduler: this.props.scheduler,
            courses: this.props.courses || [],
            alternates: []
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            scheduler: nextProps.scheduler,
            courses: nextProps.courses
        });
    },

    eventsForCourse(course) {
        return course.meetings.map(date => {
            return {
                id: course.getCRN(),
                title: course.getCourseID(),
                start: date.start,
                end: date.end,
                course: course
            };
        });
    },

    componentDidMount() {
        jQuery(React.findDOMNode(this.refs.calendar)).fullCalendar({
            height: 'auto',
            defaultView: 'agendaWeek',
            defaultDate: new Date(2007, 0, 1).toISOString(),
            header: false,
            weekends: false,
            editable: false,
            columnFormat: 'dddd',
            allDaySlot: false,
            minTime: '08:00:00',
            maxTime: '21:00:00',
            timeFormat: 'hh:mm A',
            eventStartEditable: true,

            events: (start, end, timezone, callback) => {
                let events = [];

                if (this.state.scheduler === undefined)
                    callback(events);

                else {
                    const map = this.state.scheduler.getMap();

                    for (let i = 0; i < this.state.courses.length; i++) {
                        const course = this.state.courses[i];

                        if (map[course.getCRN()])
                            events = events.concat(this.eventsForCourse(course));
                    }

                    for (let j = 0; j < this.state.alternates.length; j++) {
                        const alt = this.state.alternates[j];
                        const altEvents = this.eventsForCourse(alt);
                        for (let k = 0; k < altEvents.length; k++) {
                            altEvents[k].color = 'green';
                        }
                        events = events.concat(altEvents);
                    }

                    callback(events);
                }
            },

            eventClick: (event, jsEvent, view) => {
                showCourseDetail(event.course);
            },

            eventDragStart: event => {
                event.course.getOtherSections(courses => {
                    this.setState({
                        alternates: courses
                    });
                });
            },

            eventDrop: (event, delta, revert) => {
                const start = event.start.add(delta._milliseconds, 'ms');
                const end = event.end.add(delta._milliseconds, 'ms');
                let newCourse;

                alternateLoop:
                for (let i = 0; i < this.state.alternates.length; i++) {
                    const altMeetings = this.state.alternates[i].getMeetings();

                    for (let j = 0; j < altMeetings.length; j++) {
                        const meeting = altMeetings[j];

                        if (start.isBetween(meeting.start, meeting.end) ||
                            end.isBetween(meeting.start, meeting.end)) {
                            newCourse = this.state.alternates[i];
                            break alternateLoop;
                        }
                    }
                }

                if (newCourse !== undefined) {
                    const index = this.state.courses.indexOf(event.course);
                    UserCourses.remove(event.course);
                    UserCourses.add(newCourse);
                    this.setState(React.addons.update(this.state, {
                        alternates: {
                            $set: []
                        },
                        courses: {
                            $splice: [[index, 1, newCourse]]
                        }
                    }));
                } else {
                    this.setState({
                        alternates: []
                    });
                }
            }

        }).fullCalendar('refetchEvents');
    },

    componentDidUpdate(nextProps, nextState) {
        jQuery(React.findDOMNode(this.refs.calendar)).fullCalendar('refetchEvents');
    },

    render() {
        return <div ref='calendar'></div>;
    }
});
