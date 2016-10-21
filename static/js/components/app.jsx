import React, {PropTypes} from 'react';
import {Grid, Row, Nav, Navbar, NavDropdown, MenuItem} from 'react-bootstrap';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {DragDropContext, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {addSchedule, addCourse} from 'actions/schedules';
import {switchTerm} from 'actions/terms';
import Schedule from 'models/schedule';
import Term from 'models/term';
import NavLink from './navLink';
import {wrapComponentClass, propTypePredicate} from 'util';

const scheduleTarget = {
    drop(props, monitor) {
        const {schedule, addCourse} = props;
        const course = monitor.getItem().course;
        addCourse(schedule, course);
    }
};

function scheduleDropCollect(connect) {
    return {
        connectDropTarget: connect.dropTarget()
    };
}

let ScheduleLink = ({schedule, connectDropTarget}) => {
    const style = {
        color: schedule.getColor()
    };

    let inner = connectDropTarget(<span>
        <span className='glyphicon glyphicon-stop' style={style} />
        {schedule.name}
    </span>);

    return <NavLink key={`schedule-${schedule.id}`}
                    to={`/schedule/${schedule.id}`}>
        {inner}
    </NavLink>;
};

ScheduleLink.propTypes = {
    schedule: PropTypes.instanceOf(Schedule).isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    addCourse: PropTypes.func.isRequired
};

ScheduleLink = DropTarget('COURSE', scheduleTarget, scheduleDropCollect)(
    ScheduleLink
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
        return <ScheduleLink key={`schedule-${schedule.id}`} schedule={schedule}
                             addCourse={this.addCourse} />;
    }

    renderTerms() {
        const {terms, currentTerm} = this.props;
        const items = terms.map(term =>
            <MenuItem key={term.getID()} onClick={() => {
                this.props.dispatch(switchTerm(term));
            }}>
                {term.getName()}
            </MenuItem>
        );

        return <NavDropdown className='term-dropdown' id='termDropdown'
                            title={currentTerm ? currentTerm.getName() : ''}>
            {items}
        </NavDropdown>;
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
                    {this.renderTerms()}
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
    terms: propTypePredicate(List.isList),
    currentTerm: PropTypes.instanceOf(Term),
    dispatch: PropTypes.func
};

function mapStateToProps(state) {
    return {
        schedules: state.schedules.all,
        terms: state.terms.all,
        currentTerm: state.terms.current
    };
}

export default connect(mapStateToProps)(
    DragDropContext(HTML5Backend)(wrapComponentClass(App))
);
