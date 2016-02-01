import 'me.scss';

import React, {PropTypes} from 'react';
import jQuery from 'jquery';
import {Button} from 'react-bootstrap';
import reactMixin from 'react-mixin';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';

import {
    setUserCourse, schedulerRemoveCourse, setCourseShown, setSchedulerActive,
    removeScheduler, addScheduler, renameScheduler
} from 'actions/me';
import Scheduler from 'models/scheduler';
import UserCourseList from './userCourseList';
import SchedulerView from './schedulerView';
import ExportDialog from './export';
import AlertMixin from 'components/alertMixin';
import {wrapComponentClass} from 'util';


class Me extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            exported: null
        };
    }

    addUserCourse(course) {
        this.props.dispatch(setUserCourse(course, true));
    }

    removeUserCourse(course) {
        this.props.dispatch(setUserCourse(course, false));

        for (let scheduler of this.props.schedulers) {
            this.props.dispatch(schedulerRemoveCourse(scheduler, course));
        }
    }

    setCourseShown(scheduler, course, shown) {
        this.props.dispatch(setCourseShown(scheduler, course, shown));
    }

    replaceSection(oldSection, newSection) {
        this.addUserCourse(newSection);

        let current = this.props.currentScheduler;
        this.setCourseShown(current, oldSection, false);
        this.setCourseShown(current, newSection, true);

        for (let scheduler of this.props.schedulers) {
            if (scheduler !== current) {
                this.setCourseShown(scheduler, newSection, false);
            }
        }
    }

    setSchedulerActive(scheduler, active) {
        this.props.dispatch(setSchedulerActive(scheduler, active));
    }

    schedulerSelectFactory(scheduler) {
        return () => {
            if (scheduler !== this.props.currentScheduler) {
                this.setSchedulerActive(scheduler, true);
            }
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
        return e => {
            if (e.keyCode === 13) {
                this.schedulerEditFinishFactory(scheduler)(e);
            }
        };
    }

    schedulerEditFinishFactory(scheduler) {
        return e => {
            scheduler.setEditing(false);
            this.props.dispatch(renameScheduler(scheduler, e.target.value));
        };
    }

    schedulerRemoveFactory(scheduler) {
        return event => {
            event.stopPropagation();

            if (this.props.currentScheduler === scheduler) {
                const schedulers = this.state.schedulers;
                const index = schedulers.indexOf(scheduler) + 1;

                let current = schedulers[index];
                if (current === undefined) {
                    current = schedulers[schedulers.length - 1];
                }

                this.setSchedulerActive(current, true);
            }

            this.props.dispatch(removeScheduler(scheduler));
        };
    }

    addScheduler() {
        this.props.dispatch(addScheduler('New Schedule'));
    }

    showExportDialog() {
        this.setState({
            exported: this.props.currentScheduler
        });
    }

    hideExportDialog() {
        this.setState({
            exported: null
        });
    }

    renderSchedulerTabs() {
        const schedulerTabs = this.props.schedulers.map(scheduler => {
            let closeButton;
            if (this.props.schedulers.length > 1)
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
                    className={scheduler.isActive() ? 'active' : ''}>
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

        return <div>
            {this.renderAlerts()}

            <Button id='exportCRNButton'
                    bsStyle='info' onClick={this.showExportDialog}>
                Export Current CRNs
            </Button>
            {exportDialog}

            <UserCourseList scheduler={this.props.currentScheduler}
                            courses={this.props.userCourses}
                            delegate={this} />

            {this.renderSchedulerTabs()}

            <SchedulerView ref='schedulerView'
                           courses={this.props.userCourses}
                           scheduler={this.props.currentScheduler}
                           courseDelegate={this} />
        </div>;
    }
}

reactMixin.onClass(Me, AlertMixin);

Me.propTypes = {
    userCourses: PropTypes.array,
    schedulers: PropTypes.arrayOf(PropTypes.instanceOf(Scheduler)),
    currentScheduler: PropTypes.instanceOf(Scheduler)
};

function mapStateToProps(state) {
    let userCourses = Array.from(state.me.userCourses.values());
    userCourses.sort((a, b) => {
        const titleA = a.getCourseID(), titleB = b.getCourseID();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
    });

    let currentScheduler = state.me.schedulers.filter(s => s.isActive())[0];

    return {
        userCourses,
        schedulers: state.me.schedulers,
        currentScheduler
    };
}

export default connect(mapStateToProps)(
    DragDropContext(HTML5Backend)(wrapComponentClass(Me))
);
