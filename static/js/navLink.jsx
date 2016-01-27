import React from 'react';
import {Link, History} from 'react-router';
import Mixin from 'react-mixin';

import makeClasses from 'classnames';


class NavLink extends React.Component {
    render() {
        let active = this.history.isActive(this.props.to, this.props.query);

        return <li className={makeClasses({ active })}>
            <Link {...this.props} />
        </li>;
    }
}

Mixin.onClass(NavLink, History);

export default NavLink;
