import 'courses.scss';

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {OrderedMap, List, Map} from 'immutable';
import classNames from 'classnames';

import {fetchCourses} from 'actions/courses';
import Term from 'models/term';
import SearchBar from './searchBar';
import CourseList from './courseList';
import Filters from './filters';
import {wrapComponentClass, propTypePredicate} from 'util';


class Courses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            filtersOpen: false
        };
    }

    componentWillReceiveProps() {
        this.setState({
            loading: false
        });
    }

    fetchCoursesByPage(page) {
        let {query, filters, term, dispatch} = this.props;
        this.setState({ loading: true });
        dispatch(fetchCourses(page, query, filters, term));
    }

    fetchCoursesByQuery(query) {
        let {page, filters, term, dispatch} = this.props;
        this.setState({ loading: true });
        dispatch(fetchCourses(page, query, filters, term));
    }

    toggleFilters() {
        this.setState({
            filtersOpen: !this.state.filtersOpen
        });
    }

    fetchCoursesByFilter(filter, value) {
        const {filters, page, query, term, dispatch} = this.props;
        this.setState({ loading: true });

        let nextFilters;
        if (value !== null) {
            nextFilters = filters.set(filter, value);
        } else {
            nextFilters = filters.delete(filter);
        }

        dispatch(fetchCourses(page, query, nextFilters, term));
    }

    render() {
        const {
            query, subjects, courses, schedules, page, totalPages, filters,
            children
        } = this.props;
        const {loading, filtersOpen} = this.state;

        const containerClasses = classNames('courses-container', {
            'filters-open': filtersOpen
        });

        const courseListClasses = classNames({
            faded: loading
        });

        const filtersClasses = classNames('filters-wrapper', {
            open: filtersOpen
        });

        return (
            <div className={containerClasses}>
                <SearchBar query={query} suggestions={subjects}
                           onChange={this.fetchCoursesByQuery}
                           filtersOpen={filtersOpen}
                           toggleFilters={this.toggleFilters} />
                <CourseList className={courseListClasses}
                            courses={courses} schedules={schedules}
                            page={page} totalPages={totalPages}
                            pageChanged={this.fetchCoursesByPage} />
                <div className={filtersClasses}>
                    <Filters {...filters.toObject()}
                             onFilterChanged={this.fetchCoursesByFilter} />
                </div>
                {children}
            </div>
        );
    }
}

Courses.propTypes = {
    courses: propTypePredicate(OrderedMap.isOrderedMap, false),
    schedules: propTypePredicate(List.isList),
    totalPages: PropTypes.number,
    page: PropTypes.number,
    query: PropTypes.string,
    term: PropTypes.instanceOf(Term),
    subjects: PropTypes.arrayOf(PropTypes.string),
    filters: propTypePredicate(Map.isMap),
    dispatch: PropTypes.func,
    children: PropTypes.node
};

function mapStateToProps(state) {
    return {
        courses: state.courses.filtered,
        schedules: state.schedules.all,
        totalPages: state.courses.pages,
        page: state.courses.page,
        query: state.courses.query,
        term: state.terms.current,
        subjects: state.courses.subjects,
        filters: state.courses.filters
    };
}

export default connect(mapStateToProps)(wrapComponentClass(Courses));
