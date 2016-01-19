import React from 'react';
import update from 'react-addons-update';
import jQuery from 'jquery';
import {Button} from 'react-bootstrap';
import reactMixin from 'react-mixin';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Scheduler from './scheduler';
import UserCourses from 'courses/userCourses';
import UserCourseList from './userCourseList';
import SchedulerView from './schedulerView';
import ExportDialog from './export';
import ConflictsDialog from './conflicts';
import AlertMixin from 'alertMixin';
import {indexOf, courseOverlap, wrapComponentClass} from 'util';


class Me extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            schedulers: [],
            userCourses: [],
            currentScheduler: undefined,
            exported: null,
            conflicts: []
        };

        this.fetchUserCourses();
        this.fetchSchedulers();
    }

    fetchSchedulers() {
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
    }

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
    }

    addUserCourse(course) {
        if (indexOf(this.state.userCourses, course.getCRN(),
                (course) => { return course.getCRN(); }) < 0) {
            this.setState(update(this.state, {
                userCourses: {
                    $push: [course]
                }
            }));
        }
    }

    removeUserCourse(course) {
        const index = this.state.userCourses.indexOf(course);

        if (index > -1) {
            UserCourses.remove(course);

            for (let i = 0; i < this.state.schedulers.length; i++) {
                this.state.schedulers[i].removeCourse(course);
            }

            this.setState(update(this.state, {
                userCourses: {
                    $splice: [[index, 1]]
                }
            }));
        }
    }

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
    }

    schedulerSelectFactory(scheduler) {
        return () => {
            if (this.state.currentScheduler) {
                this.state.currentScheduler.setShown(false);
            }

            scheduler.setShown(true);
            this.setState({
                currentScheduler: scheduler
            });
        };
    }

    schedulerEditStartFactory(scheduler) {
        return () => {
            scheduler.setEditing(true);
            this.forceUpdate(() => {
                jQuery('input', event.target).select();
            });
        };
    }

    schedulerEditKeyFactory(scheduler) {
        return event => {
            if (event.keyCode === 13)
                this.schedulerEditFinishFactory(scheduler)(event);
        };
    }

    schedulerEditFinishFactory(scheduler) {
        return event => {
            scheduler.setEditing(false);
            scheduler.setName(event.target.value);
            this.forceUpdate();
        };
    }

    schedulerRemoveFactory(scheduler) {
        return event => {
            const index = this.state.schedulers.indexOf(scheduler);

            if (index > -1) {
                event.stopPropagation();
                scheduler.remove();
                this.setState(update(this.state, {
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
    }

    addScheduler() {
        Scheduler.addScheduler('New Schedule', scheduler => {
            this.state.currentScheduler.setShown(false);
            scheduler.setShown(true);
            this.setState(update(this.state, {
                schedulers: {
                    $push: [scheduler]
                },
                currentScheduler: {
                    $set: scheduler
                }
            }));
        });
    }

    showExportDialog() {
        this.setState({
            exported: this.state.currentScheduler
        });
    }

    hideExportDialog() {
        this.setState({
            exported: null
        });
    }

    fixMySchedule() {
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
            this.showConflictsDialog(conflicts);
        } else {
            this.addAlert('No conflicts found in your schedule!', 'success');
        }
    }

    showConflictsDialog(conflicts) {
        this.setState({
            conflicts: conflicts
        });
    }

    hideConflictsDialog() {
        this.setState({
            conflicts: []
        });
    }

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

        return <ul className='nav nav-tabs scheduler-tabs'>
            {schedulerTabs}
            <li>
                <a onClick={this.addScheduler}>
                    <span className='glyphicon glyphicon-plus' />
                </a>
            </li>
        </ul>;
    }

    render() {
        let exportDialog;
        if (this.state.exported !== null) {
            exportDialog = <ExportDialog scheduler={this.state.exported} onClose={this.hideExportDialog} />;
        }

        let conflictsDialog;
        if (this.state.conflicts.length > 0) {
            conflictsDialog = <ConflictsDialog conflicts={this.state.conflicts} onCancel={this.hideConflictsDialog} />;
        }

        return <div>
            {this.renderAlerts()}

            <Button id='exportCRNButton'
                    bsStyle='info' onClick={this.showExportDialog}>
                Export Current CRNs
            </Button>
            {exportDialog}

            <UserCourseList scheduler={this.state.currentScheduler}
                            courses={this.state.userCourses}
                            delegate={this} />

            <Button className='fix-schedule-btn' bsStyle='info'
                    onClick={this.fixMySchedule}>
                Fix My Schedule!
            </Button>
            {conflictsDialog}

            {this.renderSchedulerTabs()}

            <SchedulerView ref='schedulerView'
                           courses={this.state.userCourses}
                           scheduler={this.state.currentScheduler}
                           courseDelegate={this} />
        </div>;
    }
}

reactMixin.onClass(Me, AlertMixin);

export default DragDropContext(HTML5Backend)(wrapComponentClass(Me));
