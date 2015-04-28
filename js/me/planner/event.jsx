import React from 'react';
import {DragDropMixin} from 'reactDnd';

export default React.createClass({
    render() {
        const event = this.props.event;
        const eventStart = event.start.format(this.props.timeDisplayFormat);
        const eventEnd = event.end.format(this.props.timeDisplayFormat);

        return (
            <div {...this.props} className='planner-event'>
                <small>{`${eventStart} - ${eventEnd}`}</small><br/>
                {event.title}
            </div>
        );
    }
});
