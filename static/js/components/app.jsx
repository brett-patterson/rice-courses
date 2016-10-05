import React, {PropTypes} from 'react';
import {Grid, Row, Nav, Navbar} from 'react-bootstrap';
import {connect} from 'react-redux';
import {List} from 'immutable';

import {addSchedule} from 'actions/schedules';
import NavLink from './navLink';
import {wrapComponentClass, propTypePredicate} from 'util';


class App extends React.Component {
    addSchedule() {
        const {dispatch} = this.props;
        dispatch(addSchedule('New schedule'));
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
        const style = {
            color: schedule.getColor()
        };

        return <NavLink key={`schedule-${schedule.id}`}
                        to={`/schedule/${schedule.id}`}>
            <span className='glyphicon glyphicon-stop' style={style}></span>
            {schedule.name}
        </NavLink>;
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

export default connect(mapStateToProps)(wrapComponentClass(App));
