import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';

import Schedule from 'models/schedule';
import {wrapComponentClass} from 'util';


class ExportDialog extends React.Component {
    selectCRN(event) {
        event.target.select();
    }

    renderCourse(course) {
        const crn = course.getCRN();
        const crnInput = <input type='text' className='text-center'
                                value={crn} readOnly onClick={this.selectCRN} />;
        return <p key={crn}>
            <strong>{course.getCourseID()}</strong> {crnInput}
        </p>;
    }

    render() {
        const {schedule, onClose} = this.props;
        const courses = schedule.getCourses().filter(c =>
            schedule.get(c.getCRN())
        );

        return <Modal show={true} onHide={onClose}>
            <Modal.Body>{courses.map(this.renderCourse)}</Modal.Body>
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
