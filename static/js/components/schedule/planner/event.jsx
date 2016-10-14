import React, {PropTypes} from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import classNames from 'classnames';

import {wrapComponentClass, collapsePartials} from 'util';

/**
 * Check if two events overlap in time.
 * @param {object} eventOne
 * @param {object} eventTwo
 * @param {boolean} Whether or not the two events' times overlap
 */
export function eventOverlap(eventOne, eventTwo) {
    return (eventOne.start.isBetween(eventTwo.start, eventTwo.end) ||
            eventOne.end.isBetween(eventTwo.start, eventTwo.end) ||
            eventOne.start.isSame(eventTwo.start) ||
            eventOne.start.isSame(eventTwo.end) ||
            eventOne.end.isSame(eventTwo.start) ||
            eventOne.end.isSame(eventTwo.end));
}

class Event extends React.Component {
    render() {
        const {
            event, timeDisplayFormat, connectDragSource,
            connectDropTarget, isOver
        } = this.props;

        const eventStart = event.start.format(timeDisplayFormat);
        const eventEnd = event.end.format(timeDisplayFormat);

        const classes = {
            'planner-event': true,
            'planner-event-drop-hover': isOver
        };

        return connectDropTarget(connectDragSource(
            <div {...this.props} className={classNames(classes, ...event.classes)}>
                <small className='planner-note'>{event.note}</small>
                {event.title}<br/>
                <small>{`${eventStart} - ${eventEnd}`}</small>
            </div>
        ));
    }
}

Event.propTypes = {
    event: PropTypes.object.isRequired,
    planner: PropTypes.object.isRequired,
    timeDisplayFormat: PropTypes.string,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    isOver: PropTypes.bool
};

Event.defaultProps = {
    timeDisplayFormat: 'hh:mm A'
};

const EventTypes = {
    EVENT: 'event'
};

const eventSource = {
    beginDrag(props) {
        const {event, planner} = props;
        planner.onEventDragStart(event);

        return {
            event: event
        };
    },

    endDrag(props, monitor) {
        const {event, planner} = props;
        if (!monitor.didDrop()) {
            planner.onEventDragCancel(event);
        }
    }
};

function eventDragCollect(connect) {
    return {
        connectDragSource: connect.dragSource()
    };
}

const eventTarget = {
    drop(props, monitor) {
        const {event, planner} = props;
        const oldEvent = monitor.getItem().event;
        planner.onEventDrop(oldEvent, event);
    },

    canDrop(props, monitor) {
        const {event} = props;
        const one = event.course;
        const two = monitor.getItem().event.course;

        return (one.getSubject() === two.getSubject() &&
                one.getNumber() === two.getNumber() &&
                one.getSection() !== two.getSection());
    }
};

function eventDropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

export default collapsePartials(
    wrapComponentClass,
    DragSource(EventTypes.EVENT, eventSource, eventDragCollect),
    DropTarget(EventTypes.EVENT, eventTarget, eventDropCollect)
)(Event);
