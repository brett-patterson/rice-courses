import React from 'react';

import FilterManager from 'courses/filter/filterManager';
import FilterWidget from 'courses/filter/filterWidget';
import CourseFilter from 'courses/filter/courseFilter';
import CourseList from 'courses/courseList';
import {ajaxCSRF} from 'util';


const FILTERS = [
    new CourseFilter('crn', 'CRN'),
    new CourseFilter('courseID', 'Course', ['course'], '',
                     callback => {
                        ajaxCSRF({
                            url: '/courses/api/subjects/',
                            method: 'POST',
                            dataType: 'json'
                        }).done(result => {
                            callback(result);
                        });
                     }),
    new CourseFilter('title', 'Title'),
    new CourseFilter('instructor', 'Instructor'),
    new CourseFilter('meetings', 'Meetings', ['meeting']),
    new CourseFilter('credits', 'Credits'),
    new CourseFilter('distribution', 'Distribution', ['dist'], '')
];

export default React.createClass({
    getInitialState() {
        return {
            manager: new FilterManager(this.onFiltersChanged)
        };
    },

    onFiltersChanged() {
        if (this.refs && this.refs.courseList) {
            this.refs.courseList.fetchCourses();
        }
    },

    render() {
        return (
            <div>
                <FilterWidget manager={this.state.manager} filters={FILTERS} />
                <CourseList ref='courseList' filterManager={this.state.manager} />
            </div>
        );
    }
});
