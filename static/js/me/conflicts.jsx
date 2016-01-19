import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';

import Course from 'courses/course';
import {ajax, wrapComponentClass} from 'util';


class ConflictsDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: {}
        };
    }

    renderConflicts() {
        return this.props.conflicts.map((conflict, i) => {
            const [courseOne, courseTwo] = conflict;

            return (
                <li key={`conflict${i}`} className='conflict-choice'>
                    {courseOne.getCourseID()} {courseTwo.getCourseID()}
                </li>
            );
        });
    }

    onConfirm() {
        this.props.onConfirm([]);
    }

    render() {
        const conflicts = this.props.conflicts;
        const msg = 'We found some conflicts in your schedule. For each ' +
                    'conflict, please select the course you want to move.';
        const suffix = conflicts.length > 1 ? 's' : '';

        return <Modal show={true} bsSize='lg'>
            <Modal.Header>
                <Modal.Title>{`${conflicts.length} conflict${suffix}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{msg}</p>
                <ol>
                    {this.renderConflicts()}
                </ol>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.onCancel}>Cancel</Button>
                <Button onClick={this.onConfirm}>Confirm</Button>
            </Modal.Footer>
        </Modal>;
    }
}

ConflictsDialog.propTypes = {
    conflicts: PropTypes.array,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func
};

ConflictsDialog.defaultProps = {
    conflicts: [],
    onConfirm: () => {},
    onCancel: () => {}
};

// jQuery('input:checked', this).each((i, input) => {
//     ajax({
//         url: '/me/api/alternate/',
//         method: 'POST',
//         data: {
//             crn: input.value
//         },
//         dataType: 'json'
//     }).then(result => {
//         cb(Course.fromJSON(result.course),
//             result.alternates.map(courseJSON => {
//                 return Course.fromJSON(courseJSON);
//             }));
//     });
// });

export default wrapComponentClass(ConflictsDialog);
