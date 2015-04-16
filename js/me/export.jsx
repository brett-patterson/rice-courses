import React from 'react';
import Bootbox from 'bootbox';

import Course from 'courses/course';
import {ajaxCSRF} from 'util';


const ExportBody = React.createClass({
    componentDidMount() {
        ajaxCSRF({
            url: '/me/api/scheduler/export/',
            method: 'POST',
            data: {
                id: this.props.scheduler.id
            }
        }).done(data => {
            let courses = data.map(courseJSON => {
                const course = Course.fromJSON(courseJSON);
                const crn = course.getCRN();
                const crnInput = <input type='text' className='text-center'
                                        value={crn} maxLength={5} readOnly
                                        onClick={this.selectCRN} />;
                return (
                    <p key={crn}>
                        <strong>{course.getCourseID()}</strong> {crnInput}
                    </p>
                );
            });

            React.render(<div>{courses}</div>,
                         React.findDOMNode(this.refs.content));
        });
    },

    selectCRN(event) {
        event.target.select();
    },

    render() {
        return <div ref='content' />;
    }
});


export default function showSchedulerExport(scheduler) {
    let dialog = Bootbox.dialog({
        message: jQuery('<div/>', { id: 'export-modal-content' }),
        onEscape: () => {},
        show: false,
        buttons: {
            close: {
                label: 'Close'
            }
        }
    });

    dialog.on('show.bs.modal', event => {
        React.render(<ExportBody scheduler={scheduler} />,
                     jQuery('#export-modal-content', event.target)[0]);
    });

    dialog.modal('show');
}
