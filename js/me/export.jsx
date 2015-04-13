import React from 'react';
import Bootbox from 'bootbox';

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
            jQuery(React.findDOMNode(this.refs.content)).html(data);
        });
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
