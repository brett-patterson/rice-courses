import React from 'react';


export default React.createClass({
    getDefaultProps() {
        return {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startHour: 8,
            endHour: 20,
            timeWidthPercent: 3,
            slotHeight: 25,
            eventInsetPercent: 0,
            timeDisplayFormat: 'hh:mm A',
            onEventClick: () => {}
        };
    },

    getInitialState() {
        return {
            events: []
        };
    },

    componentWillReceiveProps(nextProps) {
        this.fetchEvents(nextProps.events);
    },

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
    },

    militaryTo12Hour(military) {
        let twelveHour = military % 12;

        if (twelveHour === 0) {
            twelveHour = 12;
        }

        return twelveHour;
    },

    getSlotWidthPercent() {
        return (100 - this.props.timeWidthPercent) / this.props.days.length;
    },

    getHeightForEvent(event) {
        const minutesElapsed = (event.end - event.start) / 60000;

        return minutesElapsed / 30 * this.props.slotHeight;
    },

    getLeftPercentForEvent(event) {
        const index = this.props.days.indexOf(event.start.format('dddd'));

        return this.props.timeWidthPercent +
               index * this.getSlotWidthPercent() +
               this.props.eventInsetPercent;
    },

    getTopForEvent(event) {
        return (event.start.hour() - this.props.startHour + 1) *
                2 * this.props.slotHeight;
    },

    onEventClickHandler(event) {
        return (clickEvent) => {
            this.props.onEventClick(event, clickEvent);
        };
    },

    renderEvents() {
        const eventWidth = this.getSlotWidthPercent() -
                           2 * this.props.eventInsetPercent;

        return this.state.events.map(event => {
            const eventStyle = {
                backgroundColor: event.color,
                height: this.getHeightForEvent(event),
                left: `${this.getLeftPercentForEvent(event)}%`,
                top: this.getTopForEvent(event),
                width: `${eventWidth}%`
            };

            const eventStart = event.start.format(this.props.timeDisplayFormat);
            const eventEnd = event.end.format(this.props.timeDisplayFormat);

            return (
                <div key={event.id} className='planner-event'
                     style={eventStyle}
                     onClick={this.onEventClickHandler(event)}>
                    {event.title}
                    {`${eventStart} - ${eventEnd}`}
                </div>
            );
        });
    },

    renderHeaderRows() {
        const headers = this.props.days.map((day, i) => {
            return <th width={`${this.getSlotWidthPercent()}%`}
                       height={this.props.slotHeight}
                       key={`plannerHead${i}`}>{day}</th>;
        });

        return <tr><th></th>{headers}</tr>;
    },

    renderFillerRows(major=false) {
        const rowClass = major ? 'planner-slot-major' : 'planner-slot-minor';
        return this.props.days.map((day, i) => {
            return <td key={`filler${i}`}
                       height={this.props.slotHeight} className={rowClass} />;
        });
    },

    renderPlannerRows() {
        let rows = [];

        for (let i = this.props.startHour; i <= this.props.endHour; i++) {
            const amPM = i / 12 === 0 ? 'am' : 'pm';
            rows.push(
                <tr key={`plannerTime${i}-1`}>
                    <td className='planner-axis-time planner-slot-major'
                        width={`${this.props.timeWidthPercent}%`}
                        height={this.props.slotHeight}>
                        {this.militaryTo12Hour(i)}
                        <span className='planner-am-pm'>{amPM}</span>
                    </td>
                    {this.renderFillerRows(true)}
                </tr>,
                <tr key={`plannerTime${i}-2`}>
                    <td className='planner-axis-time planner-slot-minor'
                        width={`${this.props.timeWidthPercent}%`}
                        height={this.props.slotHeight}></td>
                    {this.renderFillerRows()}
                </tr>
            );
        }

        return rows;
    },

    render() {        
        return (
            <div className='planner'>
                <div className='planner-event-overlay'>
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
});
