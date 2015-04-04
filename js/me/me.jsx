import React from 'react';
import {Table, Tr, Td} from 'reactable';

import {showCourseFactory} from 'courses/courseDetail';
import Schedulers from 'services/schedulers';
import UserCourses from 'services/userCourses';
import SchedulerView from 'me/schedulerView';
import {makeClasses} from 'util';


export default React.createClass({
    getInitialState() {
        return {
            schedulers: [],
            userCourses: [],
            currentScheduler: undefined
        };
    },

    componentWillMount() {
        this.fetchUserCourses();
        this.fetchSchedulers();
    },

    fetchSchedulers(callback) {
        Schedulers.get(schedulers => {
            this.setState({
                schedulers
            }, () => {
                for (let scheduler of this.state.schedulers)
                    if (scheduler.getShown())
                        this.setState({
                            currentScheduler: scheduler
                        });
            });
        });
    },

    fetchUserCourses(callback) {
        UserCourses.get(userCourses => {
            this.setState({
                userCourses
            }, callback);
        });
    },

    toggleCourseShownFactory(course) {
        return event => {
            const scheduler = this.state.currentScheduler;
            if (scheduler) {
                const shown = scheduler.getMap()[course.getCRN()];
                scheduler.setCourseShown(course, !shown);
                this.forceUpdate();
            }
        };
    },

    render() {
        const courses = this.state.userCourses.map(course => {
            let courseShown;
            if (this.state.currentScheduler === undefined)
                courseShown = true;
            else
                courseShown = this.state.currentScheduler.getMap()[course.getCRN()];

            const buttonClass = courseShown ? 'toggle-btn-show' : 'toggle-btn-hide';
            const eyeClasses = makeClasses({
                'glyphicon': true,
                'glyphicon-eye-open': courseShown,
                'glyphicon-eye-close': !courseShown
            });

            return (
                <Tr key={course.getCRN()}>
                    <Td column='shown'
                        handleClick={this.toggleCourseShownFactory(course)}>
                        <a className={buttonClass}>
                            <span className={eyeClasses} />
                        </a>
                    </Td>
                    <Td column='crn'
                        handleClick={showCourseFactory(course)}>
                        {course.getCRN()}
                    </Td>
                    <Td column='courseID'
                        handleClick={showCourseFactory(course)}>
                        {course.getCourseID()}
                    </Td>
                    <Td column='title'
                        handleClick={showCourseFactory(course)}>
                        {course.getTitle()}
                    </Td>
                    <Td column='instructor'
                        handleClick={showCourseFactory(course)}>
                        {course.getInstructor()}
                    </Td>
                    <Td column='meetings'
                        handleClick={showCourseFactory(course)}>
                        {course.getMeetings()}
                    </Td>
                    <Td column='distribution'
                        handleClick={showCourseFactory(course)}>
                        {course.getDistributionString()}
                    </Td>
                    <Td column='enrollment'
                        handleClick={showCourseFactory(course)}>
                        {course.getEnrollmentString()}
                    </Td>
                    <Td column='credits'
                        handleClick={showCourseFactory(course)}>
                        {course.getCredits()}
                    </Td>
                    <Td column='remove' className='remove-btn'>
                        <span className='glyphicon glyphicon-remove' />
                    </Td>
                </Tr>
            );
        });

        const columns = [
            { key: 'shown', label: '' },
            { key: 'crn', label: 'CRN' },
            { key: 'courseID', label: 'Course ID' },
            { key: 'title', label: 'Title' },
            { key: 'instructor', label: 'Instructor' },
            { key: 'meetings', label: 'Meetings' },
            { key: 'distribution', label: 'Distribution' },
            { key: 'enrollment', label: 'Enrollment' },
            { key: 'credits', label: 'Credits' },
            { key: 'remove', label: ''}
        ];

        return (
            <div>
                <div className='table-responsive'>
                    <Table ref='courseTable' columns={columns}
                           className='table table-hover course-table'>
                        {courses}
                    </Table>
                </div>
                <SchedulerView ref='schedulerView'
                               courses={this.state.userCourses}
                               scheduler={this.state.currentScheduler} />
            </div>
        );
    }
});