import React from 'react';
import {Button} from 'reactBootstrap';

import Scheduler from 'me/scheduler';
import UserCourses from 'courses/userCourses';
import UserCourseList from 'me/userCourseList';
import SchedulerView from 'me/schedulerView';
import showSchedulerExport from 'me/export';
import showConflicts from 'me/showConflicts';
import AlertMixin from 'alertMixin';
import {indexOf, courseOverlap} from 'util';


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

    removeUserCourse(course) {
        const index = this.state.userCourses.indexOf(course);

        if (index > -1) {
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

                <UserCourseList scheduler={this.state.currentScheduler}
                                courses={this.state.userCourses}
                                delegate={this} />

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