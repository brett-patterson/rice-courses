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
        }).fail(result => { console.log(result); });
    },

    render() {
        const course = this.props.course;

        let prerequisites, corequisites, restrictions;
        if (course.getPrerequisites().length > 0)
            prerequisites = <p><strong>Prerequisites:</strong> {course.getPrerequisites()}</p>;
        if (course.getCorequisites().length > 0)
            corequisites = <p><strong>Corequisites:</strong> {course.getCorequisites()}</p>;
        if (course.getRestrictions().length > 0)
            restrictions = <p><strong>Restrictions:</strong> {course.getRestrictions()}</p>;

        let courseCharts;
        if (this.state.courseQuestions === undefined) {
            courseCharts = 'Loading...';
        } else if (this.state.courseQuestions.length === 0) {
            courseCharts = 'No evaluations found';
        } else {
            courseCharts = this.state.courseQuestions.map((question, i) => {
                return <EvaluationChart key={`courseEvalChart${i}`}
                                        title={question.text}
                                        data={question.choices}
                                        type={this.state.chartType} />;
            });
        }

        let courseComments;
        if (this.state.courseComments === undefined) {
            courseComments = 'Loading...';
        } else if (this.state.courseComments.length === 0) {
            courseComments = 'No comments found';
        } else {
            courseComments = this.state.courseComments.map((comment, i) => {
                return (
                    <div className='comment' key={`courseComment${i}`}>
                        <p>{comment.text}</p>
                        <p className='comment-date'>{comment.date}</p>
                    </div>
                );
            })
        }

        let instructorCharts;
        if (this.state.instructorQuestions === undefined) {
            instructorCharts = 'Loading...';
        } else if (this.state.instructorQuestions.length === 0) {
            instructorCharts = 'No evaluations found';
        } else {
            instructorCharts = this.state.instructorQuestions.map((question, i) => {
                return <EvaluationChart key={`instructorEvalChart${i}`}
                                        title={question.text}
                                        data={question.choices}
                                        type={this.state.chartType} />;
            });
        }

        let instructorComments;
        if (this.state.instructorComments === undefined) {
            instructorComments = 'Loading...';
        } else if (this.state.instructorComments.length === 0) {
            instructorComments = 'No comments found';
        } else {
            instructorComments = this.state.instructorComments.map((comment, i) => {
                return (
                    <div className='comment' key={`instructorComment${i}`}>
                        <p>{comment.text}</p>
                        <p className='comment-date'>{comment.date}</p>
                    </div>
                );
            })
        }

        return (
            <TabbedArea defaultActiveKey={1} animation={false}>
                <TabPane eventKey={1} tab='Info'>
                    <p><strong>Credits:</strong> {course.getCredits()}</p>
                    <p><strong>Distribution:</strong> {course.getDistributionString()}</p>
                    <p><strong>Meetings:</strong> {course.getMeetingsString()}</p>
                    <p><strong>Location:</strong> {course.getLocation()}</p>
                    <p><strong>Enrollment:</strong> {course.getEnrollmentString()}</p>
                    <p><strong>Waitlist:</strong> {course.getWaitlistString()}</p>
                    {prerequisites}
                    {corequisites}
                    {restrictions}
                    <p>{course.getDescription()}</p>
                </TabPane>

                <TabPane eventKey={2} tab='Course Evaluations'>
                    {courseCharts}
                </TabPane>

                <TabPane eventKey={3} tab='Course Comments'>
                    {courseComments}
                </TabPane>

                <TabPane eventKey={4} tab='Instructor Evaluations'>
                    {instructorCharts}
                </TabPane>

                <TabPane eventKey={5} tab='Instructor Comments'>
                    {instructorComments}
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
