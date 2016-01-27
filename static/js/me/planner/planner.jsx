import 'planner.scss';

import React, {PropTypes} from 'react';

import Event, {eventOverlap} from './event';
import {wrapComponentClass} from '../../util';


class Planner extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            events: []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.fetchEvents(nextProps.eventSource);
    }

    updateEvents() {
        this.fetchEvents(this.props.eventSource);
    }

    fetchEvents(source) {
        if (source === undefined) {
            this.setState({
                events: []
            });
        } else if (typeof source === 'function') {
            source(events => {
                this.setState({
                    events
                });
            });
        } else {
            this.setState({
                events: source
            });
        }
    }

    militaryTo12Hour(military) {
        let twelveHour = military % 12;

        if (twelveHour === 0) {
            twelveHour = 12;
        }

        return twelveHour;
    }

    getSlotWidthPercent() {
        return (100 - this.props.timeWidthPercent) / this.props.days.length;
    }

    getHeightForEvent(event) {
        const minutesElapsed = (event.end - event.start) / 60000;

        return minutesElapsed / 30 * this.props.slotHeight;
    }

    getLeftPercentForEvent(event) {
        const index = this.props.days.indexOf(event.start.format('dddd'));

        return this.props.timeWidthPercent +
               index * this.getSlotWidthPercent() +
               this.props.eventInsetPercent;
    }

    getTopForEvent(event) {
        return (event.start.hour() + event.start.minutes() / 60.0 - this.props.startHour) *
                2 * this.props.slotHeight + this.props.slotHeight + 1;
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
        const eventWidth = this.getSlotWidthPercent() -
                           2 * this.props.eventInsetPercent;

        let eventsAtSameTime = {};

        for (let i = 0; i < this.state.events.length; i++) {
            const event = this.state.events[i];
            eventsAtSameTime[event.id] = [event];

            for (let j = 0; j < this.state.events.length; j++) {
                const other = this.state.events[j];

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

        return this.state.events.map(event => {
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
                       timeDisplayFormat={this.props.timeDisplayFormat}
                       onClick={this.onEventClickHandler(event)} />
            ];
        });
    }

    renderHeaderRows() {
        const headers = this.props.days.map((day, i) => {
            return <th height={this.props.slotHeight}
                       key={`plannerHead${i}`}>{day}</th>;
        });

        return (
            <tr>
                <th width={`${this.props.timeWidthPercent}%`}></th>
                {headers}
            </tr>
        );
    }

    renderFillerRows(major=false) {
        const rowClass = major ? 'planner-slot-major' : 'planner-slot-minor';
        return this.props.days.map((day, i) => {
            return <td key={`filler${i}`}
                       height={this.props.slotHeight} className={rowClass} />;
        });
    }

    renderPlannerRows() {
        let rows = [];

        for (let i = this.props.startHour; i <= this.props.endHour; i++) {
            const amPM = Math.floor(i / 12) === 0 ? 'am' : 'pm';
            rows.push(
                <tr key={`plannerTime${i}-1`}>
                    <td className='planner-axis-time planner-slot-major'
                        height={this.props.slotHeight}>
                        {this.militaryTo12Hour(i)}
                        <span className='planner-am-pm'>{amPM}</span>
                    </td>
                    {this.renderFillerRows(true)}
                </tr>,
                <tr key={`plannerTime${i}-2`}>
                    <td className='planner-axis-time planner-slot-minor'
                        height={this.props.slotHeight}></td>
                    {this.renderFillerRows()}
                </tr>
            );
        }

        return rows;
    }

    render() {
        return (
            <div className='planner'>
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
            </div>
        );
    }
}

Planner.propTypes = {
    eventSource: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
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
    eventSource: [],
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
