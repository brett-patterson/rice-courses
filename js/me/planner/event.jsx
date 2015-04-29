import React from 'react';
import {DragDropMixin} from 'reactDnd';

export default React.createClass({
    mixins: [DragDropMixin],

    statics: {
        configureDragDrop(register) {
            register('plannerEvent', {
                dragSource: {
                    beginDrag(component) {
                        const event = component.props.event;
                        component.props.planner.onEventDragStart(event);
                        return {
                            item: event
                        };
                    },

                    endDrag(component, dropEffect) {
                        const event = component.props.event;
                        if (dropEffect === null) {
                            component.props.planner.onEventDragCancel(event);
                        }
                    }
                },

                dropTarget: {
                    acceptDrop(component, event) {
                        component.props.planner.onEventDrop(event,
                            component.props.event);
                    },

                    canDrop(component, event) {
                        const one = component.props.event.course;
                        const two = event.course;

                        return (one.getSubject() === two.getSubject() &&
                                one.getNumber() === two.getNumber());
                    }
                }
            });
        }
    },

    render() {
        const event = this.props.event;
        const eventStart = event.start.format(this.props.timeDisplayFormat);
        const eventEnd = event.end.format(this.props.timeDisplayFormat);

        return (
            <div {...this.props} className='planner-event'
                 {...this.dragSourceFor('plannerEvent')}
                 {...this.dropTargetFor('plannerEvent')}>
                {event.title}<br/>
                <small>{`${eventStart} - ${eventEnd}`}</small>
            </div>
        );
    }
});
