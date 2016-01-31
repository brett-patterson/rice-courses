import 'courseDetail.scss';

import React, {PropTypes} from 'react';
import {Tabs, Tab, Modal} from 'react-bootstrap';
import {connect} from 'react-redux';

import Course from 'models/course';
import EvaluationChart from './evaluationChart';
import {ajax, wrapComponentClass} from 'util';


class CourseDetail extends React.Component {
    constructor(props, context) {
        super(props, context);

        let crn = props.params.crn;

        this.state = {
            course: props.courses[crn],
            courseQuestions: undefined,
            courseComments: undefined,
            instructorQuestions: undefined,
            instructorComments: undefined,
            chartType: 'pie'
        };

        if (this.state.course === undefined) {
            ajax({
                url: `/api/courses/${crn}/`,
                method: 'GET'
            }).then(data => {
                this.setState({
                    course: Course.fromJSON(data)
                });
            });
        }

        // ajax({
        //     url: '/evaluation/api/course/',
        //     method: 'GET',
        //     data: {
        //         crn: props.course.getCRN()
        //     }
        // }).then(result => {
        //     this.setState({
        //         courseQuestions: result.questions,
        //         courseComments: result.comments
        //     });
        // });
        //
        // ajax({
        //     url: '/evaluation/api/instructor/',
        //     method: 'GET',
        //     data: {
        //         crn: props.course.getCRN()
        //     }
        // }).then(result => {
        //     this.setState({
        //         instructorQuestions: result.questions,
        //         instructorComments: result.comments
        //     });
        // });
    }

    onClose() {
        this.context.history.goBack();
    }

    renderInfo() {
        const c = this.state.course;

        let prerequisites, corequisites, restrictions, crossList;
        if (c.getPrerequisites().length > 0)
            prerequisites = <p><strong>Prerequisites:</strong> {c.getPrerequisites()}</p>;
        if (c.getCorequisites().length > 0)
            corequisites = <p><strong>Corequisites:</strong> {c.getCorequisites()}</p>;
        if (c.getRestrictions().length > 0)
            restrictions = <p><strong>Restrictions:</strong> {c.getRestrictions()}</p>;
        if (c.getCrossListed().length > 0)
            crossList = (
                <p><strong>Cross Listed: </strong>
                {c.getCrossListed().map(crossCourse => {
                    return crossCourse.getCourseID();
                }).join(', ')}</p>
            );

        return (
            <div>
                <p><strong>CRN:</strong> {c.getCRN()}</p>
                <p><strong>Credits:</strong> {c.getCredits()}</p>
                <p><strong>Distribution:</strong> {c.getDistributionString()}</p>
                <p><strong>Meetings:</strong> {c.getMeetingsString()}</p>
                <p><strong>Location:</strong> {c.getLocation()}</p>
                <p><strong>Enrollment:</strong> {c.getEnrollmentString()}</p>
                <p><strong>Waitlist:</strong> {c.getWaitlistString()}</p>
                {prerequisites}
                {corequisites}
                {restrictions}
                {crossList}
                <p>{c.getDescription()}</p>
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
        const c = this.state.course;

        if (c === undefined) {
            return <div></div>;
        }

        return <Modal show={this.props.shown} onHide={this.onClose}
                      animation={false} bsSize='lg'
                      dialogClassName='course-modal-dialog'>
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
    courses: PropTypes.object,
    shown: PropTypes.bool
};

CourseDetail.defaultProps = {
    shown: true
};

CourseDetail.contextTypes = {
    history: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    let all = state.courses.all || [];
    let courses = all.reduce((map, c) => {
        return map.set(c.getCRN(), c);
    }, new Map());

    return {
        courses
    };
}

export default connect(mapStateToProps)(wrapComponentClass(CourseDetail));
