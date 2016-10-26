import React, {PropTypes} from 'react';
import {Link, History} from 'react-router';
import Mixin from 'react-mixin';

import makeClasses from 'classnames';


class NavLink extends React.Component {
    render() {
        const active = this.history.isActive(
            this.props.to, this.props.query
        );
        const classes = makeClasses(this.props.className, { active });

        return this.props.wrapper(<li className={classes}>
            <Link {...this.props} />
        </li>);
    }
}

NavLink.propTypes = {
    to: PropTypes.string.isRequired,
    className: PropTypes.string,
    query: PropTypes.object,
    wrapper: PropTypes.func
};

NavLink.defaultProps = {
    wrapper: x => x
};

Mixin.onClass(NavLink, History);

export default NavLink;
