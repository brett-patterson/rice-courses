import 'courses.scss';

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {OrderedMap, List} from 'immutable';
import classNames from 'classnames';

import {fetchCourses} from 'actions/courses';
import Term from 'models/term';
import SearchBar from './searchBar';
import CourseList from './courseList';
import {wrapComponentClass, propTypePredicate} from 'util';


class Courses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentWillReceiveProps() {
        this.setState({
            loading: false
        });
    }

    fetchCoursesByPage(page) {
        let {query, term, dispatch} = this.props;
        this.setState({ loading: true });
        dispatch(fetchCourses(page, query, term));
    }

    fetchCoursesByQuery(query) {
        let {page, term, dispatch} = this.props;
        this.setState({ loading: true });
        dispatch(fetchCourses(page, query, term));
    }

    render() {
        const courseListClasses = classNames({
            faded: this.state.loading
        });

        return (
            <div>
                <SearchBar query={this.props.query}
                           onChange={this.fetchCoursesByQuery} />
                <CourseList className={courseListClasses}
                            courses={this.props.courses}
                            schedules={this.props.schedules}
                            page={this.props.page}
                            totalPages={this.props.totalPages}
                            pageChanged={this.fetchCoursesByPage} />
                {this.props.children}
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
    dispatch: PropTypes.func
};

function mapStateToProps(state) {
    return {
        courses: state.courses.filtered,
        schedules: state.schedules.all,
        totalPages: state.courses.pages,
        page: state.courses.page,
        query: state.courses.query,
        term: state.terms.current
    };
}

export default connect(mapStateToProps)(wrapComponentClass(Courses));
