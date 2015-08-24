import React from 'react';
import {DragDropMixin} from 'reactDnd';
import {makeClasses} from 'util';


export default React.createClass({
    mixins: [DragDropMixin],

    propTypes: {
        event: React.PropTypes.object.isRequired,
        planner: React.PropTypes.object.isRequired,
        timeDisplayFormat: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            timeDisplayFormat: 'hh:mm A'
        };
    },

    getInitialState() {
        return {
            dropHovered: false
        };
    },

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
                                one.getNumber() === two.getNumber() &&
                                one.getSection() !== two.getSection());
                    },

                    enter(component, event) {
                        component.setState({
                            dropHovered: true
                        });
                    },

                    leave(component, event) {
                        component.setState({
                            dropHovered: false
                        });
                    }
                }
            });
        }
    },

    render() {
        const event = this.props.event;
        const eventStart = event.start.format(this.props.timeDisplayFormat);
        const eventEnd = event.end.format(this.props.timeDisplayFormat);

        const classes = {
            'planner-event': true,
            'planner-event-drop-hover': this.state.dropHovered
        };

        if (event.classes !== undefined) {
            for (let i = 0; i < event.classes.length; i++) {
                classes[event.classes[i]] = true;
            }
        }

        return (
            <div {...this.props} className={makeClasses(classes)}
                 {...this.dragSourceFor('plannerEvent')}
                 {...this.dropTargetFor('plannerEvent')}>
                <small className='planner-note'>{event.note}</small>
                {event.title}<br/>
                <small>{`${eventStart} - ${eventEnd}`}</small>
            </div>
        );
    }
});
