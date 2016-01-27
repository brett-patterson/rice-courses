import 'courses.css';

import React from 'react';

import FilterManager from './filter/filterManager';
import FilterWidget from './filter/filterWidget';
import CourseFilter from './filter/courseFilter';
import CourseList from './courseList';
import {ajax, wrapComponentClass} from '../util';


const FILTERS = [
    new CourseFilter('crn', 'CRN'),
    new CourseFilter('courseID', 'Course', ['course'], '', callback => {
        ajax({
            url: '/api/courses/subjects/',
            method: 'POST',
            dataType: 'json'
        }).then(callback);
    }),
    new CourseFilter('title', 'Title'),
    new CourseFilter('instructor', 'Instructor'),
    new CourseFilter('meetings', 'Meetings', ['meeting']),
    new CourseFilter('credits', 'Credits'),
    new CourseFilter('distribution', 'Distribution', ['dist'], '')
];

class Courses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            manager: new FilterManager(() => this.onFiltersChanged())
        };
    }

    onFiltersChanged() {
        if (this.refs && this.refs.courseList) {
            this.refs.courseList.fetchCourses();
        }
    }

    render() {
        return (
            <div>
                <FilterWidget manager={this.state.manager} filters={FILTERS} />
                <CourseList ref='courseList' filterManager={this.state.manager} />
            </div>
        );
    }
}

export default wrapComponentClass(Courses);
