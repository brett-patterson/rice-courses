import 'courses.scss';

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {OrderedMap, Map} from 'immutable';

import {fetchCourses} from 'actions/courses';
import FilterWidget from './filter/filterWidget';
import CourseFilter from './filter/courseFilter';
import CourseList from './courseList';
import {ajax, wrapComponentClass, propTypePredicate} from 'util';


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
        let {filters, order, dispatch} = this.props;
        dispatch(fetchCourses(page, filters, order));
    }

    fetchCoursesByOrder(order) {
        let {page, filters, dispatch} = this.props;
        dispatch(fetchCourses(page, filters, order));
    }

    fetchCoursesByFilters(filters) {
        let {page, order, dispatch} = this.props;
        dispatch(fetchCourses(page, filters, order));
    }

    setUserCourse(course, flag) {
        // TODO: IMPLEMENT ME
        console.log(course, flag);
    }

    render() {
        return (
            <div>
                <FilterWidget allFilters={FILTERS} filters={this.props.filters}
                              filtersChanged={this.fetchCoursesByFilters} />
                <CourseList courses={this.props.courses}
                            userCourses={this.props.userCourses}
                            page={this.props.page} order={this.props.order}
                            totalPages={this.props.totalPages}
                            pageChanged={this.fetchCoursesByPage}
                            orderChanged={this.fetchCoursesByOrder}
                            setUserCourse={this.setUserCourse} />
                {this.props.children}
            </div>
        );
    }
}

Courses.propTypes = {
    courses: propTypePredicate(OrderedMap.isOrderedMap, false),
    totalPages: PropTypes.number,
    page: PropTypes.number,
    filters: PropTypes.array,
    order: PropTypes.string,
    userCourses: propTypePredicate(Map.isMap),
    dispatch: PropTypes.func
};

function mapStateToProps(state) {
    return {
        courses: state.courses.filtered,
        totalPages: state.courses.pages,
        page: state.courses.page,
        order: state.courses.order,
        filters: state.courses.filters,
        userCourses: new Map()
    };
}

export default connect(mapStateToProps)(wrapComponentClass(Courses));
