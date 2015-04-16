import React from 'react';
import {TabbedArea, TabPane} from 'reactBootstrap';
import Bootbox from 'bootbox';
import jQuery from 'jquery';

import EvaluationChart from 'courses/evaluationChart';
import {makeClasses, ajaxCSRF} from 'util';


const CourseDetailBody = React.createClass({
    getInitialState() {
        return {
            courseQuestions: undefined,
            courseComments: undefined,
            instructorQuestions: undefined,
            instructorComments: undefined,
            chartType: 'pie'
        };
    },

    componentWillMount() {
        ajaxCSRF({
            url: '/evaluation/api/course/',
            method: 'POST',
            data: {
                crn: this.props.course.crn
            },
            responseType: 'json'
        }).done(result => {
            this.setState({
                courseQuestions: result.questions,
                courseComments: result.comments
            });
        });

        ajaxCSRF({
            url: '/evaluation/api/instructor/',
            method: 'POST',
            data: {
                crn: this.props.course.crn
            },
            responseType: 'json'
        }).done(result => {
            this.setState({
                instructorQuestions: result.questions,
                instructorComments: result.comments
            });
        });
    },

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
                })}</p>
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
    },

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
    },

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
    },

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
    },

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
    },

    render() {
        return (
            <TabbedArea defaultActiveKey={1} animation={false}>
                <TabPane eventKey={1} tab='Info'>
                    {this.renderInfo()}
                </TabPane>

                <TabPane eventKey={2} tab='Course Evaluations'>
                    {this.renderCourseCharts()}
                </TabPane>

                <TabPane eventKey={3} tab='Course Comments'>
                    {this.renderCourseComments()}
                </TabPane>

                <TabPane eventKey={4} tab='Instructor Evaluations'>
                    {this.renderInstructorCharts()}
                </TabPane>

                <TabPane eventKey={5} tab='Instructor Comments'>
                    {this.renderInstructorComments()}
                </TabPane>
            </TabbedArea>
        );
    }
});

export function showCourseFactory(course) {
    return event => {
        showCourseDetail(course);
    };
}

export function showCourseDetail(course) {
    let dialog = Bootbox.dialog({
        title: `${course.getCourseID()} - ${course.getTitle()} <br/><small>${course.getInstructor()}</small>`,
        message: jQuery('<div/>', { id: 'course-modal-content' }),
        size: 'large',
        onEscape: () => {},
        show: false,
        className: 'course-modal-dialog'
    });

    dialog.on('show.bs.modal', event => {
        React.render(<CourseDetailBody course={course} />,
                     jQuery('#course-modal-content', event.target)[0]);

        jQuery(event.target).click(event => {
            if (jQuery(event.target).hasClass('modal'))
                Bootbox.hideAll();
        });
    });

    dialog.modal('show');
}
