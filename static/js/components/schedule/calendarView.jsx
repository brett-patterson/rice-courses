import React, {PropTypes} from 'react';
import {Set} from 'immutable';

import Planner from './planner/planner';
import Schedule from 'models/schedule';
import {getHueByIndex, hsvToRgb, wrapComponentClass} from 'util';

const DAY_ORDER = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DEFAULT_DAYS = DAY_ORDER.slice(1, 6);


class CalendarView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            alternates: []
        };
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

    getEvents() {
        let events = [];
        const {schedule} = this.props;
        const {alternates} = this.state;

        if (schedule === undefined) {
            return events;
        }

        const map = schedule.getMap();
        const courses = schedule.getCourses();

        events = courses.reduce((events, course, i) => {
            if (!map.get(course.getCRN())) return events;

            const hue = getHueByIndex(i, courses.count());
            const [r, g, b] = hsvToRgb(hue, 1, 0.65);

            let alpha, classes;
            if (alternates.length > 0) {
                alpha = 0.25;
                classes = ['course-event-muted'];
            } else {
                alpha = 1;
                classes = [];
            }

            const color = `rgba(${r},${g},${b},${alpha})`;

            return events.concat(this.eventsForCourse(course, color, classes));
        }, []);

        for (let alt of alternates) {
            const altEvents = this.eventsForCourse(alt);
            for (let e of altEvents) {
                e.classes = ['course-event-alternate'];
            }

            events = events.concat(altEvents);
        }

        return events;
    }

    getDays() {
        const {schedule} = this.props;
        let days = Set(DEFAULT_DAYS);

        if (schedule === undefined)
            return days;

        const map = schedule.getMap();
        const courses = schedule.getCourses();

        for (let course of courses.values()) {
            if (map.get(course.getCRN())) {
                for (let j = 0; j < course.meetings.length; j++) {
                    const day = course.meetings[j].start.format('dddd');
                    days.add(day);
                }
            }
        }

        days = days.toArray();
        days.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

        return days;
    }

    eventClick(event) {
        const schedule = this.props.schedule;
        let location = `/schedule/${schedule.getID()}/${event.course.getCRN()}/`;
        this.context.history.push(location);
    }

    eventDragStart(event) {
        const {schedule} = this.props;

        event.course.getOtherSections().then(courses => {
            this.setState({
                alternates: courses.filter(course =>
                    !schedule.getMap().get(course.getCRN())
                )
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

        const {schedule} = this.props;
        this.props.replaceSection(schedule, oldEvent.course, newEvent.course);
    }

    render() {
        return <Planner events={this.getEvents()} days={this.getDays()}
                        onEventClick={this.eventClick}
                        onEventDragStart={this.eventDragStart}
                        onEventDragCancel={this.eventDragCancel}
                        onEventDrop={this.eventDrop} />;
    }
}

CalendarView.propTypes = {
    schedule: PropTypes.instanceOf(Schedule).isRequired,
    replaceSection: PropTypes.func
};

CalendarView.defaultProps = {
    replaceSection: () => {}
};

CalendarView.contextTypes = {
    history: PropTypes.object.isRequired
};

export default wrapComponentClass(CalendarView);
