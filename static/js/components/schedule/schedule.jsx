import 'schedule.scss';

import React, {PropTypes} from 'react';
import {Button} from 'react-bootstrap';
import reactMixin from 'react-mixin';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';

import {removeSchedule, setCourseShown,removeCourse} from 'actions/schedules';
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
            exported: null
        };
    }

    removeCourse(schedule, course) {
        this.props.dispatch(removeCourse(schedule, course));
    }

    setCourseShown(scheduler, course, shown) {
        this.props.dispatch(setCourseShown(scheduler, course, shown));
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
        const {exported} = this.state;

        if (schedule === undefined) return <div></div>;

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

            <h1>{schedule.name}</h1>

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

export default connect(mapStateToProps)(
    DragDropContext(HTML5Backend)(wrapComponentClass(ScheduleView))
);
