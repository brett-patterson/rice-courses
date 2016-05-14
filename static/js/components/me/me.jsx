import 'me.scss';

import React, {PropTypes} from 'react';
import jQuery from 'jquery';
import {Button} from 'react-bootstrap';
import reactMixin from 'react-mixin';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';

import {
    addUserCourse, removeUserCourse, setCourseShown, setSchedulerActive,
    removeScheduler, addScheduler, renameScheduler
} from 'actions/me';
import Scheduler from 'models/scheduler';
import UserCourseList from './userCourseList';
import SchedulerView from './schedulerView';
import ExportDialog from './export';
import AlertMixin from 'components/alertMixin';
import {wrapComponentClass, propTypePredicate} from 'util';


class Me extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            exported: null
        };
    }

    addUserCourse(course) {
        this.props.dispatch(addUserCourse(course));
    }

    removeUserCourse(course) {
        this.props.dispatch(removeUserCourse(course));
    }

    setCourseShown(scheduler, course, shown) {
        this.props.dispatch(setCourseShown(scheduler, course, shown));
    }

    replaceSection(oldSection, newSection) {
        const {schedulers, currentScheduler} = this.props;

        this.addUserCourse(newSection);

        this.setCourseShown(currentScheduler, oldSection, false);
        this.setCourseShown(currentScheduler, newSection, true);

        schedulers.forEach(scheduler => {
            if (!scheduler.equals(currentScheduler)) {
                this.setCourseShown(scheduler, newSection, false);
            }
        });
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
            const {schedulers, currentScheduler} = this.props;

            if (scheduler.equals(currentScheduler)) {
                const index = schedulers.indexOf(scheduler);

                let current = schedulers.get(index + 1);
                if (current === undefined) {
                    current = schedulers.get(index - 1);
                }

                if (current !== undefined) {
                    this.setSchedulerActive(current, true);
                }
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
        const {schedulers, currentScheduler} = this.props;

        const schedulerTabs = schedulers.map(scheduler => {
            let closeButton;
            if (schedulers.count() > 1)
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
                    className={scheduler.equals(currentScheduler) ? 'active' : ''}>
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
            exportDialog = <ExportDialog scheduler={this.state.exported}
                                         onClose={this.hideExportDialog} />;
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
                            setCourseShown={this.setCourseShown}
                            removeUserCourse={this.removeUserCourse} />

            {this.renderSchedulerTabs()}

            <SchedulerView ref='schedulerView'
                           courses={this.props.userCourses}
                           scheduler={this.props.currentScheduler}
                           replaceSection={this.replaceSection} />

            {this.props.children}
        </div>;
    }
}

reactMixin.onClass(Me, AlertMixin);

Me.propTypes = {
    userCourses: propTypePredicate(Map.isMap),
    schedulers: propTypePredicate(List.isList),
    currentScheduler: PropTypes.instanceOf(Scheduler),
    dispatch: PropTypes.func
};

function mapStateToProps(state) {
    let userCourses = state.me.userCourses.sort((a, b) => {
        const titleA = a.getCourseID(), titleB = b.getCourseID();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
    });

    return {
        userCourses,
        schedulers: state.me.schedulers,
        currentScheduler: state.me.activeScheduler
    };
}

export default connect(mapStateToProps)(
    DragDropContext(HTML5Backend)(wrapComponentClass(Me))
);
