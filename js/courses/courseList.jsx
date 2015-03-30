import React from 'react';

import {FILTERS} from 'courses/filters';
import FilterWidget from 'courses/filterWidget';

export default React.createClass({
    render() {
        return (
            <div>
                <FilterWidget filters={FILTERS} />
            </div>
        );
    }
});
