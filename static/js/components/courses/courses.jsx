import 'courses.scss';

import React from 'react';
import {connect} from 'react-redux';

import {fetchCourses} from 'actions/courses';
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
    fetchCoursesByPage(page) {
        let {filters, order} = this.props;
        this.props.dispatch(fetchCourses(page, filters, order));
    }

    fetchCoursesByOrder(order) {
        let {page, filters} = this.props;
        this.props.dispatch(fetchCourses(page, filters, order));
    }

    fetchCoursesByFilters(filters) {
        let {page, order} = this.props;
        this.props.dispatch(fetchCourses(page, filters, order));
    }

    render() {
        return (
            <div>
                <FilterWidget allFilters={FILTERS} filters={this.props.filters}
                              filtersChanged={this.fetchCoursesByFilters} />
                <CourseList courses={this.props.courses}
                            page={this.props.page} order={this.props.order}
                            totalPages={this.props.totalPages}
                            pageChanged={this.fetchCoursesByPage}
                            orderChanged={this.fetchCoursesByOrder} />
                {this.props.children}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        courses: state.courses.all,
        totalPages: state.courses.pages,
        page: state.courses.page,
        order: state.courses.order,
        filters: state.courses.filters
    };
}

export default connect(mapStateToProps)(wrapComponentClass(Courses));
