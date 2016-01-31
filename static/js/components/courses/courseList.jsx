import React, {PropTypes} from 'react';
import update from 'react-addons-update';
import {Pagination} from 'react-bootstrap';
import classNames from 'classnames';

import UserCourses from 'models/userCourses';
import {wrapComponentClass} from 'util';


class CourseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            courseShown: null,
            userCourses: []
        };
    }

    componentWillMount() {
        this.fetchUserCourses();
    }

    fetchUserCourses(callback) {
        UserCourses.get().then(courses => {
            this.setState({
                userCourses: courses.map(c => c.getCRN())
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
            let location = `/courses/${course.getCRN()}/`;
            this.context.history.push(location);
        };
    }

    onPageClick(event, selectedEvent) {
        this.props.pageChanged(selectedEvent.eventKey - 1);
    }

    onHeaderClickHandler(order) {
        return () => {
            if (this.props.order == order && order.startsWith('-')) {
                order = order.substring(1);
            } else if (this.props.order == order) {
                order = `-${order}`;
            }

            this.props.orderChanged(order);
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
                'sort-asc': this.props.order.substring(1) === key,
                'sort-desc': this.props.order === key,
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
        if (this.props.courses === undefined)
            return <tr><td>Loading courses...</td></tr>;
        else if (this.props.courses.length === 0)
            return <tr><td>No courses found</td></tr>;

        return this.props.courses.map(course => {
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
                    <Pagination items={this.props.totalPages}
                                activePage={this.props.page + 1}
                                onSelect={this.onPageClick}
                                maxButtons={30} first={true} last={true}
                                next={true} prev={true} />
                </div>
            </div>
        );
    }
}

CourseList.propTypes = {
    courses: PropTypes.array,
    page: PropTypes.number,
    order: PropTypes.string,
    pageChanged: PropTypes.func,
    orderChanged: PropTypes.func
};

CourseList.contextTypes = {
    history: PropTypes.object.isRequired
};

export default wrapComponentClass(CourseList);
