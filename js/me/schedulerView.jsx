import React from 'react';
import jQuery from 'jquery';
import FullCalendar from 'fullcalendar';

import Course from 'courses/course';
import UserCourses from 'courses/userCourses';
import {showCourseDetail} from 'courses/courseDetail';
import {eventOverlap, getHueByIndex, hsvToHex} from 'util';


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
        const index = this.state.courses.indexOf(course);
        const hue = getHueByIndex(index, this.state.courses.length);
        const color = hsvToHex(hue, 1, 0.65);

        return course.meetings.map(date => {
            return {
                id: course.getCRN(),
                title: course.getCourseID(),
                start: date.start,
                end: date.end,
                course: course,
                color
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
                            altEvents[k].color = 'rgba(28, 158, 37, .75)';
                        }
                        events = events.concat(altEvents);
                    }

                    callback(events);
                }
            },

            eventClick: (event) => {
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
                let newCourse;

                let offsetEvent = {
                    start: event.start.add(delta._milliseconds, 'ms'),
                    end: event.end.add(delta._milliseconds, 'ms')
                };

                alternateLoop:
                for (let i = 0; i < this.state.alternates.length; i++) {
                    const altMeetings = this.state.alternates[i].getMeetings();

                    for (let j = 0; j < altMeetings.length; j++) {
                        const meeting = altMeetings[j];

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
