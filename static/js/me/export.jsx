import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';

import Course from 'courses/course';
import Scheduler from './scheduler';
import {ajax, wrapComponentClass} from 'util';


class ExportDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: []
        };

        ajax({
            url: '/api/me/scheduler/export/',
            method: 'POST',
            data: {
                id: props.scheduler.getID()
            }
        }).then(data => {
            this.setState({
                courses: data.map(Course.fromJSON)
            });
        });
    }

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
        return <Modal show={true} onHide={this.props.onClose}>
            <Modal.Body>{this.state.courses.map(this.renderCourse)}</Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.onClose}>Close</Button>
            </Modal.Footer>
        </Modal>;
    }
}

ExportDialog.propTypes = {
    scheduler: PropTypes.instanceOf(Scheduler).isRequired,
    onClose: PropTypes.func
};

ExportDialog.defaultProps = {
    onClose: () => {}
};

export default wrapComponentClass(ExportDialog);
