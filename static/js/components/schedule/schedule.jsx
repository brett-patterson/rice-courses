import 'schedule.scss';

import React, {PropTypes} from 'react';
import {Button, Glyphicon} from 'react-bootstrap';
import reactMixin from 'react-mixin';
import {connect} from 'react-redux';

import {
    renameSchedule, removeSchedule, setCourseShown, removeCourse
} from 'actions/schedules';
import Schedule from 'models/schedule';
import CourseList from './courseList';
import CalendarView from './calendarView';
import ExportDialog from './export';
import AlertMixin from 'components/alertMixin';
import {wrapComponentClass} from 'util';


class ScheduleView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            exported: null,
            editingName: false,
            editedName: ''
        };
    }

    startEditingName() {
        this.setState({
            editingName: true,
            editedName: this.props.schedule.name
        });
    }

    stopEditingName() {
        this.setState({
            editingName: false
        }, () => {
            this.props.dispatch(
                renameSchedule(this.props.schedule, this.state.editedName)
            );
        });
    }

    removeCourse(schedule, course) {
        this.props.dispatch(removeCourse(schedule, course));
    }

    setCourseShown(schedule, course, shown) {
        this.props.dispatch(setCourseShown(schedule, course, shown));
    }

    replaceSection(schedule, oldSection, newSection) {
        this.setCourseShown(schedule, oldSection, false);
        this.setCourseShown(schedule, newSection, true);
    }

    deleteSchedule() {
        const {schedule, dispatch} = this.props;
        dispatch(removeSchedule(schedule));
    }

    showExportDialog() {
        this.setState({
            exported: this.props.schedule
        });
    }

    hideExportDialog() {
        this.setState({
            exported: null
        });
    }

    render() {
        const {schedule, canDelete, children} = this.props;
        const {exported, editingName, editedName} = this.state;

        if (schedule === undefined) return <div />;

        let nameWidget;
        if (editingName) {
            nameWidget = <input type='text' value={editedName} onChange={e => {
                this.setState({
                    editedName: e.target.value
                });
            }} onBlur={this.stopEditingName} ref={el => {
                if (el !== null) {
                    el.focus();
                }
            }} />;
        } else {
            nameWidget = <span>{schedule.name} <small><a href='#' onClick={this.startEditingName}>
                <Glyphicon glyph='pencil' />
            </a></small></span>;
        }

        let exportDialog;
        if (exported !== null) {
            exportDialog = <ExportDialog schedule={exported}
                                         onClose={this.hideExportDialog} />;
        }

        let deleteButton;
        if (canDelete) {
            deleteButton = (
                <Button bsStyle='danger' className='pull-right'
                        onClick={this.deleteSchedule}>
                    Delete schedule
                </Button>
            );
        }

        return <div>
            {this.renderAlerts()}
            {deleteButton}

            <h1>{nameWidget}</h1>

            <Button bsStyle='info' onClick={this.showExportDialog}>
                Export Current CRNs
            </Button>
            {exportDialog}

            <CourseList schedule={schedule}
                        setCourseShown={this.setCourseShown}
                        removeCourse={this.removeCourse} />

            <CalendarView schedule={schedule}
                          replaceSection={this.replaceSection} />

            {children}
        </div>;
    }
}

reactMixin.onClass(ScheduleView, AlertMixin);

ScheduleView.propTypes = {
    schedule: PropTypes.instanceOf(Schedule),
    canDelete: PropTypes.bool,
    dispatch: PropTypes.func
};

ScheduleView.defaultProps = {
    canDelete: false
};

function mapStateToProps(state, ownProps) {
    const sid = parseInt(ownProps.params.id);
    const schedule = state.schedules.all.find(s => s.getID() === sid);
    const canDelete = state.schedules.all.count() > 1;

    return {
        schedule,
        canDelete
    };
}

export default connect(mapStateToProps)(wrapComponentClass(ScheduleView));
