import React from 'react';

import Planner from 'me/planner/planner';
import Course from 'courses/course';
import Scheduler from 'me/scheduler';
import UserCourses from 'courses/userCourses';
import {showCourseDetail} from 'courses/detail/courseDetail';
import {eventOverlap, getHueByIndex, hsvToRgb, propTypeHas} from 'util';


export default React.createClass({
    propTypes: {
        scheduler: React.PropTypes.instanceOf(Scheduler),
        courses: React.PropTypes.array,
        courseDelegate: propTypeHas(['replaceSection'])
    },

    getDefaultProps() {
        return {
            courses: []
        };
    },

    getInitialState() {
        return {
            scheduler: this.props.scheduler,
            courses: this.props.courses,
            alternates: []
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            scheduler: nextProps.scheduler,
            courses: nextProps.courses
        });
    },

    eventsForCourse(course, color, classes) {
        return course.meetings.map((date, i) => {
            return {
                id: `${course.getCRN()}-${i}`,
                title: course.getCourseID(),
                start: date.start,
                end: date.end,
                course: course,
                color,
                classes
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

                let alpha, classes;
                if (this.state.alternates.length > 0) {
                    alpha = 0.25;
                    classes = ['course-event-muted'];
                } else {
                    alpha = 1;
                    classes = [];
                }

                const color = `rgba(${r},${g},${b},${alpha})`;

                if (map[course.getCRN()])
                    events = events.concat(this.eventsForCourse(course, color, classes));
            }

            for (let j = 0; j < this.state.alternates.length; j++) {
                const alt = this.state.alternates[j];
                const altEvents = this.eventsForCourse(alt);
                for (let k = 0; k < altEvents.length; k++) {
                    altEvents[k].classes = ['course-event-alternate'];
                }
                events = events.concat(altEvents);
            }

            callback(events);
        }
    },

    eventClick(event) {
        showCourseDetail(event.course);
    },

    eventDragStart(event) {
        event.course.getOtherSections(courses => {
            courses = courses.filter(course => {
                return (this.props.scheduler === undefined ||
                        (this.props.scheduler !== undefined &&
                         !this.props.scheduler.getMap()[course.getCRN()]));
            });

            this.setState({
                alternates: courses
            });
        });
    },

    eventDragCancel(event) {
        this.setState({
            alternates: []
        });
    },

    eventDrop(oldEvent, newEvent) {
        this.setState({
            alternates: []
        });

        this.props.courseDelegate.replaceSection(oldEvent.course,
                                                 newEvent.course);                    
    },

    componentDidUpdate(nextProps, nextState) {
        this.refs.planner.updateEvents();
    },

    render() {
        return <Planner ref='planner' eventSource={this.getEvents}
                        onEventClick={this.eventClick}
                        onEventDragStart={this.eventDragStart}
                        onEventDragCancel={this.eventDragCancel}
                        onEventDrop={this.eventDrop} />;
    }
});
