import 'courses.scss';

import React from 'react';
import {connect} from 'react-redux';

import {fetchCourses} from 'actions/courses';
import FilterManager from './filter/filterManager';
import FilterWidget from './filter/filterWidget';
import CourseFilter from './filter/courseFilter';
import CourseList from './courseList';
import {ajax, wrapComponentClass} from 'util';


const FILTERS = [
    new CourseFilter('crn', 'CRN'),
    new CourseFilter('courseID', 'Course', ['course'], '', callback => {
        ajax({
            url: '/api/courses/subjects/',
            method: 'GET'
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

    componentDidMount() {
        this.props.dispatch(fetchCourses([], 0));
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
                <CourseList ref='courseList' courses={this.props.courses}
                            filterManager={this.state.manager}
                            totalPages={this.props.totalPages} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        courses: state.courses.all,
        totalPages: state.courses.pages
    };
}

export default connect(mapStateToProps)(wrapComponentClass(Courses));
