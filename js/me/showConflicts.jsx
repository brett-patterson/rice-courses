import React from 'react';
import Bootbox from 'bootbox';

import Course from 'courses/course';
import {ajaxCSRF} from 'util';


const ConflictsBody = React.createClass({
    propTypes: {
        conflicts: React.PropTypes.array
    },

    getDefaultProps() {
        return {
            conflicts: []
        };
    },

    onClearClicked(event) {
        jQuery(event.target).siblings().find('label').each((i, label) => {
            jQuery(label).removeClass('active').find('input')
                .prop('checked', false);
        });
    },

    renderConflicts() {
        return this.props.conflicts.map((conflict, i) => {
            const [courseOne, courseTwo] = conflict;

            return (
                <li key={`conflict${i}`} className='conflict-choice'>
                    <div className='btn-group' data-toggle='buttons'>
                        <label className='btn btn-default'>
                            <input type='radio' value={courseOne.getCRN()} />
                            {courseOne.getCourseID()}
                        </label>

                        <label className='btn btn-default'>
                            <input type='radio' value={courseTwo.getCRN()} />
                            {courseTwo.getCourseID()}
                        </label>
                    </div>
                    <a onClick={this.onClearClicked}
                       className='glyphicon glyphicon-ban-circle clear-btn' />
                </li>
            );
        });
    },

    render() {
        const msg = 'We found some conflicts in your schedule. For each ' +
                    'conflict, please select the course you want to move.';

        return (
            <div>
                <p>{msg}</p>
                <ol>
                    {this.renderConflicts()}
                </ol>
            </div>
        );
    }
});


export default function showConflicts(conflicts, cb) {
    const suffix = conflicts.length > 1 ? 's' : '';
    let dialog = Bootbox.dialog({
        title: `${conflicts.length} conflict${suffix}`,
        message: jQuery('<div/>', { id: 'conflicts-modal-content' }),
        size: 'large',
        show: false,
        closeButton: false,
        buttons: {
            cancel: {
                label: 'Cancel',
                className: 'btn-danger'
            },
            confirm: {
                label: 'Confirm',
                className: 'btn-success',
                callback() {
                    jQuery('input:checked', this).each((i, input) => {
                        ajaxCSRF({
                            url: '/me/api/alternate/',
                            method: 'POST',
                            data: {
                                crn: input.value
                            },
                            dataType: 'json'
                        }).done(result => {
                            cb(Course.fromJSON(result.course),
                                result.alternates.map(courseJSON => {
                                    return Course.fromJSON(courseJSON);
                                }));
                        });
                    });
                }
            }
        }
    });

    dialog.on('show.bs.modal', event => {
        React.render(<ConflictsBody conflicts={conflicts} />,
                     jQuery('#conflicts-modal-content', event.target)[0]);
    });

    dialog.modal('show');
}
