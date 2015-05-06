import React from 'react';

import Course from 'courses/course';
import {showCourseFactory} from 'courses/detail/courseDetail';
import UserCourses from 'courses/userCourses';
import FilterManager from 'courses/filter/filterManager';
import {makeClasses, ajaxCSRF, propTypeHas} from 'util';

export default React.createClass({
    propTypes: {
        filterManager: React.PropTypes.instanceOf(FilterManager).isRequired
    },

    getInitialState() {
        return {
            courses: undefined,
            userCourses: [],
            page: 0,
            totalPages: 0,
            order: 'courseID'
        };
    },

    componentWillMount() {
        this.fetchCourses();
        this.fetchUserCourses();
    },

    fetchCourses() {
        Course.get(data => {
            this.setState({
                courses: data.courses,
                totalPages: data.pages
            });
        }, this.props.filterManager.getFiltersForServer(), this.state.page,
           this.state.order);
    },

    fetchUserCourses(callback) {
        UserCourses.get(courses => {
            let userCourses = [];

            for (let i = 0; i < courses.length; i++)
                userCourses.push(courses[i].getCRN());

            this.setState({
                userCourses
            }, callback);
        });
    },

    isUserCourse(course) {
        return this.state.userCourses.indexOf(course.getCRN()) > -1;
    },

    toggleUserCourseFactory(course) {
        return event => {
            const crn = course.getCRN();
            const index = this.state.userCourses.indexOf(crn);

            if (index > -1) {
                this.setState(React.addons.update(this.state, {
                    userCourses: {
                        $splice: [[index, 1]]
                    }
                }));

                UserCourses.remove(course);
            } else {
                this.setState(React.addons.update(this.state, {
                    userCourses: {
                        $push: [crn]
                    }
                }));

                UserCourses.add(course);
            }
        };
    },

    onPageClickHandler(page) {
        return event => {
            this.setState({
                page
            }, this.fetchCourses);
        };
    },

    onHeaderClickHandler(order) {
        return event => {
            if (this.state.order == order && order.startsWith('-')) {
                order = order.substring(1);
            } else if (this.state.order == order) {
                order = `-${order}`;
            }

            this.setState({
                order
            }, this.fetchCourses);
        };
    },

    renderCourseHeaders() {
        const columns = [
            ['crn', 'CRN'],
            ['courseID', 'Course'],
            ['title', 'Title'],
            ['instructor', 'Instructor'],
            ['meetings', 'Meetings'],
            ['distribution', 'Distribution', true],
            ['enrollment', 'Enrollment', true],
            ['credits', 'Credits', true]
        ];

        const headers = columns.map(column => {
            const [key, name, center] = column;
            const classes = makeClasses({
                'sort-asc': this.state.order.substring(1) === key,
                'sort-desc': this.state.order === key,
                'text-center': center
            });

            return (
                <th onClick={this.onHeaderClickHandler(key)}
                    className={classes} key={key}>
                    {name}
                </th>
            );
        });

        return (
            <tr>
                <th></th>
                {headers}
            </tr>
        );
    },

    renderCourseRows() {
        if (this.state.courses === undefined)
            return <tr><td column='userCourse'>Loading courses...</td></tr>;
        else if (this.state.courses.length === 0)
            return <tr><td column='userCourse'>No courses found</td></tr>;

        return this.state.courses.map(course => {
            const isUserCourse = this.isUserCourse(course);

            const userClasses = makeClasses({
                'user-course': isUserCourse,
                'not-user-course': !isUserCourse
            });

            const heartClasses = makeClasses({
                'glyphicon': true,
                'glyphicon-heart': isUserCourse,
                'glyphicon-heart-empty': !isUserCourse
            });

            const percent = course.getEnrollmentPercentage();
            const enrollClasses = makeClasses({
                'enroll-warning': percent >= 75 && percent < 100,
                'enroll-full': percent === 100,
                'text-center': true
            });

            return (
                <tr key={course.getCRN()}>
                    <td column='userCourse'
                        onClick={this.toggleUserCourseFactory(course)}>
                        <a className={userClasses}>
                            <span className={heartClasses} />
                        </a>
                    </td>
                    <td column='crn'
                        onClick={showCourseFactory(course)}>
                        {course.getCRN()}
                    </td>
                    <td column='courseID'
                        onClick={showCourseFactory(course)}>
                        {course.getCourseID()}
                    </td>
                    <td column='title'
                        onClick={showCourseFactory(course)}>
                        {course.getTitle()}
                    </td>
                    <td column='instructor'
                        onClick={showCourseFactory(course)}>
                        {course.getInstructor()}
                    </td>
                    <td column='meetings'
                        onClick={showCourseFactory(course)}>
                        {course.getMeetingsString()}
                    </td>
                    <td column='distribution' className='text-center'
                        onClick={showCourseFactory(course)}>
                        {course.getDistributionString()}
                    </td>
                    <td column='enrollment' className={enrollClasses}
                        onClick={showCourseFactory(course)}>
                        {course.getEnrollmentString()}
                    </td>
                    <td column='credits' className='text-center'
                        onClick={showCourseFactory(course)}>
                        {course.getCredits()}
                    </td>
                </tr>
            );
        });
    },

    renderPagination() {
        let pages = [];

        for (let i = 0; i < this.state.totalPages; i++) {
            const classes = makeClasses({
                'course-page-button': true,
                'course-current-page': i == this.state.page
            });

            pages.push(
                <a className={classes} key={`coursePage${i}`}
                   onClick={this.onPageClickHandler(i)}>
                    {i+1}
                </a>
            );
        }

        return (
            <div className='course-pagination'>
                {pages}
            </div>
        );
    },

    render() {
        return (
            <div className='table-responsive'>
                <table className='table table-hover course-table'>
                    <thead>
                        {this.renderCourseHeaders()}
                    </thead>
                    <tbody>
                        {this.renderCourseRows()}
                    </tbody>
                </table>
                {this.renderPagination()}
            </div>
        );
    }
});
