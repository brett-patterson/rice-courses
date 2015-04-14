import React from 'react';
import {Table, Tr, Td} from 'reactable';
import {Button, ButtonGroup} from 'reactBootstrap';
import ZeroClipboard from 'zeroClipboard';

import {showCourseFactory} from 'courses/courseDetail';
import Scheduler from 'me/scheduler';
import UserCourses from 'courses/userCourses';
import SchedulerView from 'me/schedulerView';
import showSchedulerExport from 'me/export';
import showConflicts from 'me/showConflicts';
import AlertMixin from 'alertMixin';
import {indexOf, courseOverlap, makeClasses} from 'util';


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
                for (let i = 0; i < this.state.schedulers.length; i++) {
                    const scheduler = this.state.schedulers[i];

                    if (scheduler.getShown())
                        this.setState({
                            currentScheduler: scheduler
                        });
                }
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

    addUserCourse(course) {
        if (indexOf(this.state.userCourses, course.getCRN(),
                (course) => { return course.getCRN(); }) < 0) {
            this.setState(React.addons.update(this.state, {
                userCourses: {
                    $push: [course]
                }
            }));
        }
    },

    replaceSection(oldSection, newSection) {
        this.addUserCourse(newSection);
        this.state.currentScheduler.setCourseShown(oldSection, false);
        this.state.currentScheduler.setCourseShown(newSection, true);
        UserCourses.add(newSection);

        for (let i = 0; i < this.state.schedulers.length; i++) {
            const scheduler = this.state.schedulers[i];

            if (scheduler !== this.state.currentScheduler) {
                scheduler.setCourseShown(newSection, false);
            }
        }

        this.forceUpdate();
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

                for (let i = 0; i < this.state.schedulers.length; i++) {
                    this.state.schedulers[i].removeCourse(course);
                }

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

            for (let i = 0; i < this.state.userCourses.length; i++) {
                const course = this.state.userCourses[i];

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

        for (let i = 0; i < this.state.userCourses.length; i++) {
            const credits = this.state.userCourses[i].getCredits();
            
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

    fixMySchedule(event) {
        let courses = this.state.userCourses.filter(course => {
            return this.state.currentScheduler.getMap()[course.getCRN()];
        });

        let conflicts = [];

        for (let i = 0; i < courses.length; i++) {
            let courseOne = courses[i];
            for (let j = i; j < courses.length; j++) {
                let courseTwo = courses[j];
                if (courseOne !== courseTwo &&
                    courseOverlap(courseOne, courseTwo)) {
                    conflicts.push([courseOne, courseTwo]);
                }
            }
        }

        if (conflicts.length > 0) {
            showConflicts(conflicts, this.addConflictAlternates);
        } else {
            this.addAlert('No conflicts found in your schedule!', 'success');
        }
    },

    addConflictAlternates(course, alternates) {
        if (alternates.length === 0) {
            this.addAlert(`No alternate courses found for ${course.getCourseID()} that do not conflict with your current schedule.`,
                          'danger', 6000);
        } else {
            this.state.currentScheduler.setCourseShown(course, false);

            for (let i = 0; i < alternates.length; i++) {
                const alternate = alternates[i];

                if (indexOf(this.state.userCourses, alternate.getCRN(), course => {
                    return course.getCRN();
                }) < 0) {
                    UserCourses.add(alternate);
                    this.setState(React.addons.update(this.state, {
                        userCourses: {
                            $push: [alternate]
                        }
                    }));
                }

                this.state.currentScheduler.setCourseShown(alternate, true);
                this.forceUpdate();
            }
        }
    },

    componentDidUpdate(prevProps, prevState) {
        jQuery('.copy-btn').each((index, button) => {
            this.clip = new ZeroClipboard(button);
        });
    },

    renderCourseRows() {
        return this.state.userCourses.map(course => {
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
                        {course.getMeetingsString()}
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
    },

    renderCourseTable() {
        const columns = [
            { key: 'shown', label: '' },
            { key: 'crn', label: 'CRN' },
            { key: 'courseID', label: 'Course' },
            { key: 'title', label: 'Title' },
            { key: 'instructor', label: 'Instructor' },
            { key: 'meetings', label: 'Meetings' },
            { key: 'distribution', label: 'Distribution' },
            { key: 'enrollment', label: 'Enrollment' },
            { key: 'credits', label: 'Credits' },
            { key: 'remove', label: ''}
        ];

        return (
            <div className='table-responsive'>
                <Table ref='courseTable' columns={columns}
                       className='table table-hover course-table'>
                    {this.renderCourseRows()}
                </Table>
            </div>
        );
    },

    renderCourseCredits() {
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

        return (
            <div className='course-credits'>
                <p>{totalLabel} <strong>{totalCredits}</strong></p>
                <p>{shownLabel} <strong>{creditsShown}</strong></p>
            </div>
        );
    },

    renderSchedulerTabs() {
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
            <ul className='nav nav-tabs scheduler-tabs'>
                {schedulerTabs}
                <li>
                    <a onClick={this.addScheduler}>
                        <span className='glyphicon glyphicon-plus' />
                    </a>
                </li>
            </ul>
        );
    },

    render() {
        return (
            <div>
                {this.renderAlerts()}

                <Button id='exportCRNButton'
                        bsStyle='info' onClick={this.exportScheduler}>
                    Export Current CRNs
                </Button>

                {this.renderCourseTable()}

                {this.renderCourseCredits()}

                <Button className='fix-schedule-btn' bsStyle='info'
                        onClick={this.fixMySchedule}>
                    Fix My Schedule!
                </Button>

                {this.renderSchedulerTabs()}

                <SchedulerView ref='schedulerView'
                               courses={this.state.userCourses}
                               scheduler={this.state.currentScheduler}
                               courseDelegate={this} />
            </div>
        );
    }
});