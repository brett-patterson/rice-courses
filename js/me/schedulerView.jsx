import React from 'react';

import Planner from 'me/planner/planner';
import Course from 'courses/course';
import UserCourses from 'courses/userCourses';
import {showCourseDetail} from 'courses/courseDetail';
import {eventOverlap, getHueByIndex, hsvToRgb} from 'util';


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

    eventsForCourse(course, color) {
        return course.meetings.map((date, i) => {
            return {
                id: `${course.getCRN()}-${i}`,
                title: course.getCourseID(),
                start: date.start,
                end: date.end,
                course: course,
                color
            };
        });
    },

    getEvents(callback) {
        let events = [];

        if (this.state.scheduler === undefined)
            callback(events);

        else {
            const map = this.state.scheduler.getMap();

            for (let i = 0; i < this.state.courses.length; i++) {
                const course = this.state.courses[i];
                const hue = getHueByIndex(i, this.state.courses.length);
                const [r, g, b] = hsvToRgb(hue, 1, 0.65);

                let alpha;
                if (this.state.alternates.length > 0) {
                    alpha = 0.4;
                } else {
                    alpha = 1;
                }

                const color = `rgba(${r},${g},${b},${alpha})`;

                if (map[course.getCRN()])
                    events = events.concat(this.eventsForCourse(course, color));
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

    onEventClick(event) {
        showCourseDetail(event.course);
    },

    eventDragStart(event) {
        event.course.getOtherSections(courses => {
            this.setState({
                alternates: courses
            });
        });
    },

    eventDrop(event, delta, revert) {
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
    },

    componentDidUpdate(nextProps, nextState) {
        // Update events
    },

    render() {
        return <Planner events={this.getEvents}
                        onEventClick={this.onEventClick} />;
    }
});
