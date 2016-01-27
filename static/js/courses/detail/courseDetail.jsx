import 'courseDetail.css';

import React, {PropTypes} from 'react';
import {Tabs, Tab, Modal} from 'react-bootstrap';

import Course from 'courses/course';
import EvaluationChart from './evaluationChart';
import {ajax, wrapComponentClass} from 'util';


class CourseDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            courseQuestions: undefined,
            courseComments: undefined,
            instructorQuestions: undefined,
            instructorComments: undefined,
            chartType: 'pie'
        };

        // ajax({
        //     url: '/evaluation/api/course/',
        //     method: 'POST',
        //     data: {
        //         crn: props.course.getCRN()
        //     },
        //     responseType: 'json'
        // }).then(result => {
        //     this.setState({
        //         courseQuestions: result.questions,
        //         courseComments: result.comments
        //     });
        // });
        //
        // ajax({
        //     url: '/evaluation/api/instructor/',
        //     method: 'POST',
        //     data: {
        //         crn: props.course.getCRN()
        //     },
        //     responseType: 'json'
        // }).then(result => {
        //     this.setState({
        //         instructorQuestions: result.questions,
        //         instructorComments: result.comments
        //     });
        // });
    }

    renderInfo() {
        const course = this.props.course;

        let prerequisites, corequisites, restrictions, crossList;
        if (course.getPrerequisites().length > 0)
            prerequisites = <p><strong>Prerequisites:</strong> {course.getPrerequisites()}</p>;
        if (course.getCorequisites().length > 0)
            corequisites = <p><strong>Corequisites:</strong> {course.getCorequisites()}</p>;
        if (course.getRestrictions().length > 0)
            restrictions = <p><strong>Restrictions:</strong> {course.getRestrictions()}</p>;
        if (course.getCrossListed().length > 0)
            crossList = (
                <p><strong>Cross Listed: </strong>
                {course.getCrossListed().map(crossCourse => {
                    return crossCourse.getCourseID();
                }).join(', ')}</p>
            );

        return (
            <div>
                <p><strong>CRN:</strong> {course.getCRN()}</p>
                <p><strong>Credits:</strong> {course.getCredits()}</p>
                <p><strong>Distribution:</strong> {course.getDistributionString()}</p>
                <p><strong>Meetings:</strong> {course.getMeetingsString()}</p>
                <p><strong>Location:</strong> {course.getLocation()}</p>
                <p><strong>Enrollment:</strong> {course.getEnrollmentString()}</p>
                <p><strong>Waitlist:</strong> {course.getWaitlistString()}</p>
                {prerequisites}
                {corequisites}
                {restrictions}
                {crossList}
                <p>{course.getDescription()}</p>
            </div>
        );
    }

    renderCourseCharts() {
        if (this.state.courseQuestions === undefined) {
            return 'Loading...';
        } else if (this.state.courseQuestions.length === 0) {
            return 'No evaluations found';
        }

        return this.state.courseQuestions.map((question, i) => {
            return <EvaluationChart key={`courseEvalChart${i}`}
                                    title={question.text}
                                    data={question.choices}
                                    type={this.state.chartType} />;
        });
    }

    renderCourseComments() {
        if (this.state.courseComments === undefined) {
            return 'Loading...';
        } else if (this.state.courseComments.length === 0) {
            return 'No comments found';
        }

        return this.state.courseComments.map((comment, i) => {
            return (
                <div className='comment' key={`courseComment${i}`}>
                    <p>{comment.text}</p>
                    <p className='comment-date'>{comment.date}</p>
                </div>
            );
        });
    }

    renderInstructorCharts() {
        if (this.state.instructorQuestions === undefined) {
            return 'Loading...';
        } else if (this.state.instructorQuestions.length === 0) {
            return 'No evaluations found';
        }

        return this.state.instructorQuestions.map((question, i) => {
            return <EvaluationChart key={`instructorEvalChart${i}`}
                                    title={question.text}
                                    data={question.choices}
                                    type={this.state.chartType} />;
        });
    }

    renderInstructorComments() {
        if (this.state.instructorComments === undefined) {
            return 'Loading...';
        } else if (this.state.instructorComments.length === 0) {
            return 'No comments found';
        }

        return this.state.instructorComments.map((comment, i) => {
            return (
                <div className='comment' key={`instructorComment${i}`}>
                    <p>{comment.text}</p>
                    <p className='comment-date'>{comment.date}</p>
                </div>
            );
        });
    }

    render() {
        const c = this.props.course;

        return <Modal show={this.props.shown} onHide={this.props.onClose}
                      dialogClassName='course-modal-dialog' bsSize='lg'>
            <Modal.Header closeButton>
                <Modal.Title>
                    {c.getCourseID()} - {c.getTitle()}<br/>
                    <small>{c.getInstructor()}</small>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey={1} animation={false}>
                    <Tab eventKey={1} title='Info'>
                        {this.renderInfo()}
                    </Tab>

                    <Tab eventKey={2} title='Course Evaluations'>
                        {this.renderCourseCharts()}
                    </Tab>

                    <Tab eventKey={3} title='Course Comments'>
                        {this.renderCourseComments()}
                    </Tab>

                    <Tab eventKey={4} title='Instructor Evaluations'>
                        {this.renderInstructorCharts()}
                    </Tab>

                    <Tab eventKey={5} title='Instructor Comments'>
                        {this.renderInstructorComments()}
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>;
    }
}

CourseDetail.propTypes = {
    course: PropTypes.instanceOf(Course).isRequired,
    onClose: PropTypes.func.isRequired,
    shown: PropTypes.bool
};

CourseDetail.defaultProps = {
    shown: true
};

CourseDetail = wrapComponentClass(CourseDetail);

export default {
    getInitialState() {
        return {
            courseShown: null
        };
    },

    showCourseDetail(course) {
        this.setState({
            courseShown: course
        });
    },

    hideCourseDetail() {
        this.setState({
            courseShown: null
        });
    },

    renderCourseDetails(courses) {
        if (!courses || courses.length === 0) {
            return null;
        }

        return courses.map(course => {
            const shown = this.state.courseShown !== null && this.state.courseShown.getCRN() === course.getCRN();
            return <CourseDetail key={`detail-${course.getCRN()}`} course={course}
                                 shown={shown} onClose={this.hideCourseDetail} />;
        });
    }
};
