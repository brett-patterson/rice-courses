import React from 'react';
import {Table, Tr, Td} from 'reactable';
import ZeroClipboard from 'zeroClipboard';
import jQuery from 'jquery';

import {showCourseFactory} from 'courses/courseDetail';
import Scheduler from 'me/scheduler';
import UserCourses from 'courses/userCourses';
import SchedulerView from 'me/schedulerView';
import AlertMixin from 'alertMixin';
import {makeClasses} from 'util';


export default React.createClass({
    mixins: [AlertMixin],

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
        Scheduler.fetchAll(schedulers => {
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

    componentDidUpdate(prevProps, prevState) {
        jQuery('.copy-btn').each((index, button) => {
            this.clip = new ZeroClipboard(button);
        });
    },

    copyButtonClicked(event) {
        let crn = jQuery(event.target).attr('data-clipboard-text');
        this.addAlert(`Copied CRN <strong>${crn}</strong> to clipboard.`,
                      'success');
        event.stopPropagation();
    },

    schedulerSelectFactory(scheduler) {
        return event => {
            this.state.currentScheduler.setShown(false);
            scheduler.setShown(true);
            this.setState({
                currentScheduler: scheduler
            });
        };
    },

    schedulerRemoveFactory(scheduler) {
        return event => {
            const index = this.state.schedulers.indexOf(scheduler);

            if (index > -1) {
                scheduler.remove();
                this.setState(React.addons.update(this.state, {
                    schedulers: {
                        $splice: [[index, 1]]
                    }
                }), () => {
                    if (this.state.currentScheduler === scheduler) {
                        const schedulers = this.state.schedulers;
                        let current = schedulers[index];
                        if (current === undefined)
                            current = schedulers[schedulers.length - 1];

                        current.setShown(true);
                        this.setState({
                            currentScheduler: current
                        });
                    }
                });
            }
        };
    },

    addScheduler() {
        Scheduler.addScheduler('New Schedule', scheduler => {
            this.state.currentScheduler.setShown(false);
            scheduler.setShown(true);
            this.setState(React.addons.update(this.state, {
                schedulers: {
                    $push: [scheduler]
                },
                currentScheduler: {
                    $set: scheduler
                }
            }));
        });
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
                        <span>
                            {course.getCRN() + ' '}
                            <a className='copy-btn'
                               data-clipboard-text={course.getCRN()}
                               onClick={this.copyButtonClicked}>
                               <span className='glyphicon glyphicon-paperclip' />
                            </a>
                        </span>
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

        const schedulerTabs = this.state.schedulers.map(scheduler => {
            let closeButton;
            if (this.state.schedulers.length > 1)
                closeButton = (
                    <span className='scheduler-close glyphicon glyphicon-remove'
                          onClick={this.schedulerRemoveFactory(scheduler)} />
                );

            return (
                <li key={scheduler.getID()}
                    className={scheduler.getShown() ? 'active' : ''}>
                    <a onClick={this.schedulerSelectFactory(scheduler)}>
                        <span>
                            {scheduler.getName()}
                        </span>
                        {closeButton}
                    </a>
                </li>
            );
        });

        return (
            <div>
                {this.getAlerts()}
                <div className='table-responsive'>
                    <Table ref='courseTable' columns={columns}
                           className='table table-hover course-table'>
                        {courses}
                    </Table>
                </div>
                <ul className='nav nav-tabs scheduler-tabs'>
                    {schedulerTabs}
                    <li>
                        <a onClick={this.addScheduler}>
                            <span className='glyphicon glyphicon-plus' />
                        </a>
                    </li>
                </ul>
                <SchedulerView ref='schedulerView'
                               courses={this.state.userCourses}
                               scheduler={this.state.currentScheduler} />
            </div>
        );
    }
});