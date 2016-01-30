import React from 'react';
import {Link} from 'react-router';
import {Grid, Row, Col, Nav} from 'react-bootstrap';

import NavLink from './navLink';
import {wrapComponentClass} from 'util';


class App extends React.Component {
    renderLoginInfo() {
        const user = window.USERNAME;
        if (user) {
            return <span>
                <strong>{user}</strong><br/>
                (<a href='/logout/'>Sign out</a>)
            </span>;
        }

        return <a href='/login/'>Sign in</a>;
    }

    render() {
        return <Grid fluid={true}>
            <Row>
                <Col sm={1} className='main-nav'>
                    <Link to='/'>
                        <img className='logo' src='/static/img/logo_no_text.png' />
                    </Link>

                    <div className='login-container'>
                        {this.renderLoginInfo()}
                    </div>

                    <Nav bsStyle='pills' stacked>
                        <NavLink to='/courses/'>
                            <span className='glyphicon glyphicon-search'></span>
                            <span className='hidden-sm'>
                                <br/>Search
                            </span>
                        </NavLink>
                        <NavLink to='/me/'>
                            <span className='glyphicon glyphicon-user'></span>
                            <span className='hidden-sm'>
                                <br/>My Courses
                            </span>
                        </NavLink>
                        <NavLink to='/help/'>
                            <span className='glyphicon glyphicon-question-sign'></span>
                            <span className='hidden-sm'>
                                <br/>Help
                            </span>
                        </NavLink>
                    </Nav>
                </Col>
                <Col sm={11}>
                    {this.props.children}
                </Col>
            </Row>
            <Row>
                <h4 className='text-center'>
                    <small>&copy; 2016 Brett Patterson</small>
                </h4>
            </Row>
        </Grid>;
    }
}

export default wrapComponentClass(App);
