import React, {PropTypes} from 'react';
import {Map} from 'immutable';

import Planner from './planner/planner';
import Scheduler from 'models/scheduler';
import {getHueByIndex, hsvToRgb, propTypePredicate, wrapComponentClass} from 'util';


const DAY_ORDER = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

class SchedulerView extends React.Component {
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
        const {scheduler, courses} = this.props;
        const {alternates} = this.state;

        if (scheduler === undefined) {
            return events;
        }

        const map = scheduler.getMap();

        events = courses.toArray().reduce((events, course, i) => {
            if (!map[course.getCRN()]) return events;

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
        const {scheduler, courses} = this.props;
        let days = [];

        if (scheduler === undefined)
            return days;

        const map = scheduler.getMap();

        for (let course of courses.values()) {
            if (map[course.getCRN()]) {
                for (let j = 0; j < course.meetings.length; j++) {
                    const day = course.meetings[j].start.format('dddd');
                    if (days.indexOf(day) < 0) {
                        days.push(day);
                    }
                }
            }
        }

        days.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

        return days;
    }

    eventClick(event) {
        let location = `/me/${event.course.getCRN()}/`;
        this.context.history.push(location);
    }

    eventDragStart(event) {
        const {scheduler} = this.props;
        if (scheduler === undefined) return;

        event.course.getOtherSections().then(courses => {
            this.setState({
                alternates: courses.filter(course =>
                    !scheduler.getMap()[course.getCRN()]
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

        this.props.replaceSection(oldEvent.course, newEvent.course);
    }

    render() {
        return <div>
            <Planner events={this.getEvents()} days={this.getDays()}
                     onEventClick={this.eventClick}
                     onEventDragStart={this.eventDragStart}
                     onEventDragCancel={this.eventDragCancel}
                     onEventDrop={this.eventDrop} />
        </div>;
    }
}

SchedulerView.propTypes = {
    scheduler: PropTypes.instanceOf(Scheduler),
    courses: propTypePredicate(Map.isMap),
    replaceSection: PropTypes.func
};

SchedulerView.defaultProps = {
    courses: new Map(),
    replaceSection: () => {}
};

SchedulerView.contextTypes = {
    history: PropTypes.object.isRequired
};

export default wrapComponentClass(SchedulerView);
