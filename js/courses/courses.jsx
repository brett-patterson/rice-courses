import React from 'react';

import FilterManager from 'courses/filterManager';
import FilterWidget from 'courses/filterWidget';
import CourseFilter from 'courses/courseFilter';
import CourseList from 'courses/courseList';
import {ajaxCSRF} from 'util';


const FILTERS = [
    new CourseFilter('crn', 'CRN'),
    new CourseFilter('courseID', 'Course ID', ['course_id', 'course id'], '',
                     CourseFilter.contains, callback => {
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
    new CourseFilter('distribution', 'Distribution', ['dist'], '', (one, two) => {
        const [roman, integer] = one.split(' ');
        return (roman.toLowerCase() === two.toLowerCase() ||
                integer.toLowerCase() == two.toLowerCase());
        })
];


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
        this.refs.courseList.updateFilteredCourses();
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
