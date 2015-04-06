import React from 'react';
import jQuery from 'jquery';
import FullCalendar from 'fullcalendar';
import Moment from 'moment';

import {showCourseDetail} from 'courses/courseDetail';


const DAY_MAP = {
    'M': '01',
    'T': '02',
    'W': '03',
    'R': '04',
    'F': '05'
};


export default React.createClass({
    getInitialState() {
        return {
            scheduler: this.props.scheduler,
            courses: this.props.courses || []
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            scheduler: nextProps.scheduler,
            courses: nextProps.courses
        });
    },

    datesForCourse(course) {
        let dates = [];

        const meetingsPattern = /([A-Z,\s]+)([0-9,\s]+)-([0-9,\s]+)/;
        const matches = meetingsPattern.exec(course.getMeetings());

        const days = jQuery.trim(matches[1]).split(', ');
        const starts = jQuery.trim(matches[2]).split(', ');
        const ends = jQuery.trim(matches[3]).split(', ');

        for (let i = 0; i < days.length; i++) {
            const dayString = days[i], start = starts[i], end = ends[i];

            for (let j = 0; j < dayString.length; j++) {
                const day = DAY_MAP[dayString[j]];
                const format = 'YYYY-MM-DD HHmm';

                dates.push({
                    start: Moment(`2007-01-${day} ${starts[i]}`, format),
                    end: Moment(`2007-01-${day} ${ends[i]}`, format)
                });
            }
        }

        return dates;
    },

    eventsForCourse(course) {
        return this.datesForCourse(course).map(date => {
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
                    callback(events);
                }
            },

            eventRender: (event, element) => {
                // attachContextMenu(event.id, element);
            },

            eventClick: (event, jsEvent, view) => {
                showCourseDetail(event.course);
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
