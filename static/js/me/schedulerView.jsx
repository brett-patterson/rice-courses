import React, {PropTypes} from 'react';
import reactMixin from 'react-mixin';

import Planner from './planner/planner';
import Scheduler from './scheduler';
import CourseDetailMixin from '../courses/detail/courseDetail';
import {getHueByIndex, hsvToRgb, propTypeHas, wrapComponentClass} from '../util';


const DAY_ORDER = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

class SchedulerView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scheduler: props.scheduler,
            courses: props.courses,
            alternates: []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            scheduler: nextProps.scheduler,
            courses: nextProps.courses
        });
    }

    eventsForCourse(course, color, classes) {
        return course.meetings.map((date, i) => {
            return {
                id: `${course.getCRN()}-${i}`,
                title: course.getCourseID(),
                note: course.getLocation(),
                start: date.start,
                end: date.end,
                course: course,
                color,
                classes
            };
        });
    }

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
    }

    getDays() {
        let days = [];

        if (this.state.scheduler === undefined)
            return days;

        const map = this.state.scheduler.getMap();

        for (let i = 0; i < this.state.courses.length; i++) {
            const course = this.state.courses[i];
            if (map[course.getCRN()]) {
                for (let j = 0; j < course.meetings.length; j++) {
                    const day = course.meetings[j].start.format('dddd');
                    if (days.indexOf(day) < 0) {
                        days.push(day);
                    }
                }
            }
        }

        days.sort((a, b) => {
            return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
        });

        return days;
    }

    eventClick(event) {
        this.showCourseDetail(event.course);
    }

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
    }

    eventDragCancel() {
        this.setState({
            alternates: []
        });
    }

    eventDrop(oldEvent, newEvent) {
        this.setState({
            alternates: []
        });

        this.props.courseDelegate.replaceSection(oldEvent.course,
                                                 newEvent.course);
    }

    componentDidUpdate() {
        this.refs.planner.updateEvents();
    }

    render() {
        return <div>
            <Planner ref='planner' eventSource={this.getEvents}
                     days={this.getDays()}
                     onEventClick={this.eventClick}
                     onEventDragStart={this.eventDragStart}
                     onEventDragCancel={this.eventDragCancel}
                     onEventDrop={this.eventDrop} />
            {this.renderCourseDetails(this.state.courses)}
        </div>;
    }
}

SchedulerView.propTypes = {
    scheduler: PropTypes.instanceOf(Scheduler),
    courses: PropTypes.array,
    courseDelegate: propTypeHas(['replaceSection'])
};

SchedulerView.defaultProps = {
    courses: []
};

reactMixin.onClass(SchedulerView, CourseDetailMixin);

export default wrapComponentClass(SchedulerView);
