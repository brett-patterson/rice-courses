import React from 'react';

import {FILTERS} from 'courses/filters';
import FilterManager from 'courses/filterManager';
import FilterWidget from 'courses/filterWidget';
import CourseList from 'courses/courseList';

export default React.createClass({
    getInitialState() {
        return {
            manager: new FilterManager(this.onFiltersChanged)
        };
    },

    filter(objects) {
        return this.state.manager.filter(objects);
    },

    onFiltersChanged() {
        this.refs.courseList.forceUpdate();
    },

    render() {
        return (
            <div>
                <FilterWidget manager={this.state.manager} filters={FILTERS} />
                <CourseList ref='courseList' filterDelegate={this} />
            </div>
        );
    }
});
