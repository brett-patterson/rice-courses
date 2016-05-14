import 'planner.scss';

import React, {PropTypes} from 'react';

import Event, {eventOverlap} from './event';
import {wrapComponentClass} from 'util';


class Planner extends React.Component {
    militaryTo12Hour(military) {
        let twelveHour = military % 12;
        return twelveHour === 0 ? 12 : twelveHour;
    }

    getSlotWidthPercent() {
        const {timeWidthPercent, days} = this.props;
        return (100 - timeWidthPercent) / days.length;
    }

    getHeightForEvent(event) {
        const minutesElapsed = (event.end - event.start) / 60000;

        return minutesElapsed / 30 * this.props.slotHeight;
    }

    getLeftPercentForEvent(event) {
        const {days, timeWidthPercent, eventInsetPercent} = this.props;
        const i = days.indexOf(event.start.format('dddd'));

        return timeWidthPercent + i * this.getSlotWidthPercent() + eventInsetPercent;
    }

    getTopForEvent(event) {
        const {startHour, slotHeight} = this.props;
        return (event.start.hour() + event.start.minutes() / 60.0 - startHour) *
                2 * slotHeight + slotHeight + 1;
    }

    onEventClickHandler(event) {
        return (clickEvent) => {
            this.props.onEventClick(event, clickEvent);
        };
    }

    onEventDragStart(event) {
        this.props.onEventDragStart(event);
    }

    onEventDragCancel(event) {
        this.props.onEventDragCancel(event);
    }

    onEventDrop(oldEvent, newEvent) {
        this.props.onEventDrop(oldEvent, newEvent);
    }

    renderEvents() {
        const {events, eventInsetPercent, timeDisplayFormat} = this.props;

        const eventWidth = this.getSlotWidthPercent() - 2 * eventInsetPercent;

        let eventsAtSameTime = {};

        for (let event of events) {
            eventsAtSameTime[event.id] = [event];

            for (let other of events) {
                if (event !== other && eventOverlap(event, other)) {
                    eventsAtSameTime[event.id].push(other);
                }
            }

            eventsAtSameTime[event.id].sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                } else if (a.id === b.id) {
                    return 0;
                } else {
                    return 1;
                }
            });
        }

        return events.map(event => {
            const sameTime = eventsAtSameTime[event.id];
            const width = eventWidth / sameTime.length;
            const offset = width * sameTime.indexOf(event);

            const eventStyle = {
                backgroundColor: event.color,
                height: this.getHeightForEvent(event),
                left: `${this.getLeftPercentForEvent(event) + offset}%`,
                top: this.getTopForEvent(event),
                width: `${width}%`
            };

            const overlayStyle = {
                height: eventStyle.height,
                left: eventStyle.left,
                top: eventStyle.top,
                width: eventStyle.width
            };

            return [
                <div className='planner-event-underlay' style={overlayStyle} />,
                <Event key={event.id}
                       event={event} style={eventStyle} planner={this}
                       timeDisplayFormat={timeDisplayFormat}
                       onClick={this.onEventClickHandler(event)} />
            ];
        });
    }

    renderHeaderRows() {
        const {days, slotHeight, timeWidthPercent} = this.props;

        const headers = days.map((day, i) => {
            return <th height={slotHeight} key={`plannerHead${i}`}>{day}</th>;
        });

        return <tr>
            <th width={`${timeWidthPercent}%`}></th>
            {headers}
        </tr>;
    }

    renderFillerRows(major=false) {
        const {days, slotHeight} = this.props;
        const rowClass = major ? 'planner-slot-major' : 'planner-slot-minor';

        return days.map((day, i) => {
            return <td key={`filler${i}`}
                       height={slotHeight} className={rowClass} />;
        });
    }

    renderPlannerRows() {
        const {startHour, endHour, slotHeight} = this.props;
        let rows = [];

        for (let i = startHour; i <= endHour; i++) {
            const amPM = Math.floor(i / 12) === 0 ? 'am' : 'pm';
            rows.push(
                <tr key={`plannerTime${i}-1`}>
                    <td className='planner-axis-time planner-slot-major'
                        height={slotHeight}>
                        {this.militaryTo12Hour(i)}
                        <span className='planner-am-pm'>{amPM}</span>
                    </td>
                    {this.renderFillerRows(true)}
                </tr>,
                <tr key={`plannerTime${i}-2`}>
                    <td className='planner-axis-time planner-slot-minor'
                        height={slotHeight}></td>
                    {this.renderFillerRows()}
                </tr>
            );
        }

        return rows;
    }

    render() {
        return <div className='planner'>
            <div className='planner-overlay'>
                {this.renderEvents()}
            </div>
            <table>
                <thead>
                    {this.renderHeaderRows()}
                </thead>
                <tbody>
                    {this.renderPlannerRows()}
                </tbody>
            </table>
        </div>;
    }
}

Planner.propTypes = {
    events: PropTypes.array,
    days: PropTypes.array,
    startHour: PropTypes.number,
    endHour: PropTypes.number,
    timeWidthPercent: PropTypes.number,
    slotHeight: PropTypes.number,
    eventInsetPercent: PropTypes.number,
    timeDisplayFormat: PropTypes.string,
    onEventClick: PropTypes.func,
    onEventDragStart: PropTypes.func,
    onEventDragCancel: PropTypes.func,
    onEventDrop: PropTypes.func
};

Planner.defaultProps = {
    events: [],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startHour: 8,
    endHour: 20,
    timeWidthPercent: 3,
    slotHeight: 25,
    eventInsetPercent: 0.4,
    timeDisplayFormat: 'hh:mm A',
    onEventClick: () => {},
    onEventDragStart: () => {},
    onEventDragCancel: () => {},
    onEventDrop: () => {}
};

export default wrapComponentClass(Planner);
