import React, {PropTypes} from 'react';
import reactMixin from 'react-mixin';
import update from 'react-addons-update';
import {Pagination} from 'react-bootstrap';
import classNames from 'classnames';

import Course from './course';
import CourseDetailMixin from './detail/courseDetail';
import UserCourses from './userCourses';
import FilterManager from './filter/filterManager';
import {wrapComponentClass} from '../util';

class CourseList extends React.Component {
    constructor() {
        super();
        this.state = {
            courses: undefined,
            courseShown: null,
            userCourses: [],
            page: 0,
            totalPages: 0,
            order: 'courseID'
        };
    }

    componentWillMount() {
        this.fetchCourses();
        this.fetchUserCourses();
    }

    fetchCourses() {
        Course.get(data => {
            this.setState({
                courses: data.courses,
                totalPages: data.pages
            });
        }, this.props.filterManager.getFiltersForServer(), this.state.page,
           this.state.order);
    }

    fetchUserCourses(callback) {
        UserCourses.get(courses => {
            let userCourses = [];

            for (let i = 0; i < courses.length; i++)
                userCourses.push(courses[i].getCRN());

            this.setState({
                userCourses
            }, callback);
        });
    }

    isUserCourse(course) {
        return this.state.userCourses.indexOf(course.getCRN()) > -1;
    }

    toggleUserCourseFactory(course) {
        return () => {
            const crn = course.getCRN();
            const index = this.state.userCourses.indexOf(crn);

            if (index > -1) {
                this.setState(update(this.state, {
                    userCourses: {
                        $splice: [[index, 1]]
                    }
                }));

                UserCourses.remove(course);
            } else {
                this.setState(update(this.state, {
                    userCourses: {
                        $push: [crn]
                    }
                }));

                UserCourses.add(course);
            }
        };
    }

    showCourseDetailFactory(course) {
        return () => {
            this.showCourseDetail(course);
        };
    }

    onPageClick(event, selectedEvent) {
        this.setState({
            page: selectedEvent.eventKey - 1
        }, this.fetchCourses);
    }

    onHeaderClickHandler(order) {
        return () => {
            if (this.state.order == order && order.startsWith('-')) {
                order = order.substring(1);
            } else if (this.state.order == order) {
                order = `-${order}`;
            }

            this.setState({
                order
            }, this.fetchCourses);
        };
    }

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
            const classes = classNames({
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
    }

    renderCourseRows() {
        if (this.state.courses === undefined)
            return <tr><td>Loading courses...</td></tr>;
        else if (this.state.courses.length === 0)
            return <tr><td>No courses found</td></tr>;

        return this.state.courses.map(course => {
            const isUserCourse = this.isUserCourse(course);

            const userClasses = classNames({
                'user-course': isUserCourse,
                'not-user-course': !isUserCourse
            });

            const heartClasses = classNames('glyphicon', {
                'glyphicon-heart': isUserCourse,
                'glyphicon-heart-empty': !isUserCourse
            });

            const percent = course.getEnrollmentPercentage();
            const enrollClasses = classNames('text-center', {
                'enroll-warning': percent >= 75 && percent < 100,
                'enroll-full': percent === 100
            });

            return (
                <tr key={course.getCRN()}>
                    <td onClick={this.toggleUserCourseFactory(course)}>
                        <a className={userClasses}>
                            <span className={heartClasses} />
                        </a>
                    </td>
                    <td onClick={this.showCourseDetailFactory(course)}>
                        {course.getCRN()}
                    </td>
                    <td onClick={this.showCourseDetailFactory(course)}>
                        {course.getCourseID()}
                    </td>
                    <td onClick={this.showCourseDetailFactory(course)}>
                        {course.getTitle()}
                    </td>
                    <td onClick={this.showCourseDetailFactory(course)}>
                        {course.getInstructor()}
                    </td>
                    <td onClick={this.showCourseDetailFactory(course)}>
                        {course.getMeetingsString()}
                    </td>
                    <td className='text-center'
                        onClick={this.showCourseDetailFactory(course)}>
                        {course.getDistributionString()}
                    </td>
                    <td className={enrollClasses}
                        onClick={this.showCourseDetailFactory(course)}>
                        {course.getEnrollmentString()}
                    </td>
                    <td className='text-center'
                        onClick={this.showCourseDetailFactory(course)}>
                        {course.getCredits()}
                    </td>
                </tr>
            );
        });
    }

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

                <div className='text-center'>
                    <Pagination items={this.state.totalPages}
                                activePage={this.state.page + 1}
                                onSelect={this.onPageClick}
                                maxButtons={30} first={true} last={true}
                                next={true} prev={true} />
                </div>

                {this.renderCourseDetails(this.state.courses)}
            </div>
        );
    }
}

CourseList.propTypes = {
    filterManager: PropTypes.instanceOf(FilterManager).isRequired
};

reactMixin.onClass(CourseList, CourseDetailMixin);

export default wrapComponentClass(CourseList);
