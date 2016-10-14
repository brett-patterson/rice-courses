import React, {PropTypes} from 'react';
import {
    Modal, Button, FormGroup, InputGroup, FormControl, Glyphicon
} from 'react-bootstrap';

import Schedule from 'models/schedule';
import ClipboardTrigger from '../clipboardTrigger';
import {wrapComponentClass} from 'util';


class ExportDialog extends React.Component {
    selectCRN(event) {
        event.target.select();
    }

    renderCourse(course) {
        const crn = course.getCRN();
        const crnInput = <FormGroup>
            <InputGroup>
                <FormControl type='text' className='text-center'
                             value={crn} readOnly onClick={this.selectCRN} />
                <InputGroup.Addon>
                    <ClipboardTrigger text={crn} className='crn-copy'>
                        <Glyphicon glyph='copy' />
                    </ClipboardTrigger>
                </InputGroup.Addon>
            </InputGroup>
        </FormGroup>;

        return <div key={crn}>
            <strong>{course.getCourseID()}</strong> {crnInput}
        </div>;
    }

    render() {
        const {schedule, onClose} = this.props;
        const courses = schedule.getCourses().filter(c =>
            schedule.getMap().get(c.getCRN())
        );

        return <Modal show={true} onHide={onClose}>
            <Modal.Body><form>{courses.map(this.renderCourse)}</form></Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>;
    }
}

ExportDialog.propTypes = {
    schedule: PropTypes.instanceOf(Schedule).isRequired,
    onClose: PropTypes.func
};

ExportDialog.defaultProps = {
    onClose: () => {}
};

export default wrapComponentClass(ExportDialog);
