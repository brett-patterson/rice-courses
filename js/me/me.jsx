import React from 'react';
import {Table, Tr, Td} from 'reactable';
import {Button} from 'reactBootstrap';
import ZeroClipboard from 'zeroClipboard';
import jQuery from 'jquery';

import {showCourseFactory} from 'courses/courseDetail';
import Scheduler from 'me/scheduler';
import UserCourses from 'courses/userCourses';
import SchedulerView from 'me/schedulerView';
import showSchedulerExport from 'me/export';
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
            userCourses.sort((a, b) => {
                const titleA = a.getCourseID(), titleB = b.getCourseID();
                if (titleA < titleB)
                    return -1;

                if (titleA > titleB)
                    return 1;

                return 0;
            });

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

    removeCourseFactory(course) {
        return event => {
            const index = this.state.userCourses.indexOf(course);

            if (index > -1) {
                event.stopPropagation();
                UserCourses.remove(course);
                this.setState(React.addons.update(this.state, {
                    userCourses: {
                        $splice: [[index, 1]]
                    }
                }));                
            }
        };
    },

    getCreditsShown() {
        let vary = false;
        let total = 0;

        if (this.state.currentScheduler !== undefined) {
            const map = this.state.currentScheduler.getMap();

            for (let course of this.state.userCourses) {
                if (map[course.getCRN()]) {
                    const credits = course.getCredits();
                    
                    if (credits.indexOf('to') > -1)
                        vary = true;

                    total += parseFloat(credits);
                }
            }
        }

        return [total.toFixed(1), vary];
    },

    getTotalCredits() {
        let vary = false;
        let total = 0;

        for (let course of this.state.userCourses) {
            const credits = course.getCredits();
            
            if (credits.indexOf('to') > -1)
                vary = true;

            total += parseFloat(credits);
        }

        return [total.toFixed(1), vary];
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

    schedulerEditStartFactory(scheduler) {
        return event => {
            scheduler.setEditing(true);
            this.forceUpdate(() => {
                jQuery('input', event.target).select();
            });
        };
    },

    schedulerEditKeyFactory(scheduler) {
        return event => {
            if (event.keyCode === 13)
                this.schedulerEditFinishFactory(scheduler)(event);
        };
    },

    schedulerEditFinishFactory(scheduler) {
        return event => {
            scheduler.setEditing(false);
            scheduler.setName(event.target.value);
            this.forceUpdate();
        };
    },

    schedulerRemoveFactory(scheduler) {
        return event => {
            const index = this.state.schedulers.indexOf(scheduler);

            if (index > -1) {
                event.stopPropagation();
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

    exportScheduler(event) {
        if (this.state.currentScheduler !== undefined)
            showSchedulerExport(this.state.currentScheduler);
    },

    componentDidUpdate(prevProps, prevState) {
        jQuery('.copy-btn').each((index, button) => {
            this.clip = new ZeroClipboard(button);
        });
    },

    render() {
        let courses = this.state.userCourses.map(course => {
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
                    <Td column='remove' className='remove-btn'
                        handleClick={this.removeCourseFactory(course)}>
                        <span className='glyphicon glyphicon-remove' />
                    </Td>
                </Tr>
            );
        });

        const [creditsShown, shownVary] = this.getCreditsShown();
        let shownLabel;
        if (shownVary)
            shownLabel = 'Credits shown (approximate):';
        else
            shownLabel = 'Credits shown:';

        const [totalCredits, totalVary] = this.getTotalCredits();
        let totalLabel;
        if (totalVary)
            totalLabel = 'Total credits (approximate):';
        else
            totalLabel = 'Total credits:';

        courses = courses.concat(
            <Tr key='creditsShown'>
                <Td className='text-right' column='enrollment'>
                    <strong>{shownLabel}</strong>
                </Td>
                <Td column='credits'><strong>{creditsShown}</strong></Td>
            </Tr>,
            <Tr key='totalCredits'>
                <Td className='text-right' column='enrollment'>
                    <strong>{totalLabel}</strong>
                </Td>
                <Td column='credits'><strong>{totalCredits}</strong></Td>
            </Tr>
        );

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

            let schedulerName;
            if (scheduler.getEditing())
                schedulerName = (
                    <input type='text' defaultValue={scheduler.getName()}
                           onBlur={this.schedulerEditFinishFactory(scheduler)}
                           onKeyDown={this.schedulerEditKeyFactory(scheduler)} />
                );
            else
                schedulerName = <span>{scheduler.getName()}</span>;

            return (
                <li key={scheduler.getID()}
                    className={scheduler.getShown() ? 'active' : ''}>
                    <a onClick={this.schedulerSelectFactory(scheduler)}
                       onDoubleClick={this.schedulerEditStartFactory(scheduler)}>
                        {schedulerName}
                        {closeButton}
                    </a>
                </li>
            );
        });

        return (
            <div>
                {this.getAlerts()}
                <Button bsStyle='info' onClick={this.exportScheduler}>
                    Export Current CRNs
                </Button>
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