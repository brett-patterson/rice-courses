import React from 'react';
import {TabbedArea, TabPane} from 'reactBootstrap';
import Bootbox from 'bootbox';
import jQuery from 'jquery';

import {makeClasses} from 'util';

const CourseDetailBody = React.createClass({
    render() {
        const course = this.props.course;

        let prerequisites, corequisites, restrictions;
        if (course.getPrerequisites().length > 0)
            prerequisites = <p><strong>Prerequisites:</strong> {course.getPrerequisites()}</p>;
        if (course.getCorequisites().length > 0)
            corequisites = <p><strong>Corequisites:</strong> {course.getCorequisites()}</p>;
        if (course.getRestrictions().length > 0)
            restrictions = <p><strong>Restrictions:</strong> {course.getRestrictions()}</p>;

        return (
            <TabbedArea defaultActiveKey={1} animation={false}>
                <TabPane eventKey={1} tab='Info'>
                    <h3>{course.getTitle()}<br/><small>{course.getInstructor()}</small></h3>
                    <p><strong>Credits:</strong> {course.getCredits()}</p>
                    <p><strong>Meetings:</strong> {course.getMeetings()} </p>
                    <p><strong>Location:</strong> {course.getLocation()}</p>
                    <p><strong>Enrollment:</strong> {course.getEnrollmentString()}</p>
                    <p><strong>Waitlist:</strong> {course.getWaitlistString()}</p>
                    {prerequisites}
                    {corequisites}
                    {restrictions}
                    <p>{course.getDescription()}</p>
                </TabPane>

                <TabPane eventKey={2} tab='Course Evaluations'>
                </TabPane>

                <TabPane eventKey={3} tab='Course Comments'>
                </TabPane>

                <TabPane eventKey={4} tab='Instructor Evaluations'>
                </TabPane>

                <TabPane eventKey={5} tab='Instructor Comments'>
                </TabPane>
            </TabbedArea>
        );
    }
});

export default function showCourseDetail(course) {
    let dialog = Bootbox.dialog({
        message: jQuery('<div/>', { class: 'course-modal-content' }),
        size: 'large',
        onEscape: () => {},
        show: false
    });

    dialog.on('show.bs.modal', event => {
        React.render(<CourseDetailBody course={course} />, jQuery('.course-modal-content', event.target)[0]);
    });

    dialog.modal('show');
}
