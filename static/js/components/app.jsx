import React, {PropTypes} from 'react';
import {Grid, Row, Nav, Navbar} from 'react-bootstrap';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {DragDropContext, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {addSchedule, addCourse} from 'actions/schedules';
import Schedule from 'models/schedule';
import NavLink from './navLink';
import {wrapComponentClass, propTypePredicate} from 'util';

const scheduleTarget = {
    drop(props, monitor) {
        const {schedule, addCourse} = props;
        const course = monitor.getItem().course;
        addCourse(schedule, course);
    }
};

function scheduleDropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

let ScheduleLink = class ScheduleLink extends React.Component {
    render() {
        const {schedule, connectDropTarget} = this.props;

        const style = {
            color: schedule.getColor()
        };

        return connectDropTarget(<NavLink key={`schedule-${schedule.id}`}
                        to={`/schedule/${schedule.id}`}>
            <span className='glyphicon glyphicon-stop' style={style} />
            {schedule.name}
        </NavLink>);
    }
};

ScheduleLink.propTypes = {
    schedule: PropTypes.instanceOf(Schedule),
    connectDropTarget: PropTypes.func
};

ScheduleLink = DropTarget('COURSE', scheduleTarget, scheduleDropCollect)(
    wrapComponentClass(ScheduleLink)
);

class App extends React.Component {
    addSchedule() {
        this.props.dispatch(addSchedule('New schedule'));
    }

    addCourse(schedule, course) {
        this.props.dispatch(addCourse(schedule, course));
    }

    renderLoginInfo() {
        // TODO: don't pass through window :(
        const user = window.USERNAME;
        if (user) {
            return <span>
                <strong className='nav-username'>{user} </strong>
                (<a className='navbar-link' href='/logout/'>Sign out</a>)
            </span>;
        }

        return <a className='navbar-link' href='/login/'>Sign in</a>;
    }

    renderScheduleLink(schedule) {
        return <ScheduleLink key={`schedule-${schedule.id}`} schedule={schedule} />;
    }

    renderNav() {
        const scheduleLinks = this.props.schedules
            .map(this.renderScheduleLink)
            .toArray();

        return <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                    <img className='logo' src='/static/img/logo.png' />
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse className='top-links'>
                <Nav>
                    <NavLink to='/courses/'>
                        <span className='glyphicon glyphicon-search' />
                        Search
                    </NavLink>
                    {scheduleLinks}
                    <li><a href='#' onClick={this.addSchedule}>
                        <span className='glyphicon glyphicon-plus-sign' />
                        <span className='hidden-sm hidden-md hidden-lg'>New Schedule</span>
                    </a></li>
                </Nav>
                <Nav pullRight>
                    <li>
                        <span className='navbar-text'>
                            {this.renderLoginInfo()}
                        </span>
                    </li>
                    <NavLink to='/help/'>
                        <span className='glyphicon glyphicon-question-sign' />
                        Help
                    </NavLink>
                </Nav>
            </Navbar.Collapse>
        </Navbar>;
    }

    render() {
        return <div>
            {this.renderNav()}

            <Grid fluid={true}>
                <Row className='content'>
                    {this.props.children}
                </Row>
                <Row>
                    <h4 className='text-center'>
                        <small>&copy; 2016 Brett Patterson</small>
                    </h4>
                </Row>
            </Grid>
        </div>;
    }
}

App.propTypes = {
    schedules: propTypePredicate(List.isList),
    dispatch: PropTypes.func
};

function mapStateToProps(state) {
    return {
        schedules: state.schedules.all
    };
}

export default connect(mapStateToProps)(
    DragDropContext(HTML5Backend)(wrapComponentClass(App))
);
