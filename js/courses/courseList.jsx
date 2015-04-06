import React from 'react';
import {Table, Tr, Td} from 'reactable';

import Course from 'courses/course';
import {showCourseFactory} from 'courses/courseDetail';
import UserCourses from 'courses/userCourses';
import {makeClasses, ajaxCSRF} from 'util';

export default React.createClass({
    getInitialState() {
        return {
            courses: undefined,
            userCourses: [],
            filtered: undefined
        };
    },

    componentWillMount() {
        this.fetchCourses();
        this.fetchUserCourses();
    },

    componentDidMount() {
        this.refs.courseTable.setState({
            currentSort: {
                column: 'courseID',
                direction: 1
            }
        });
    },

    fetchCourses() {
        ajaxCSRF({
            'url': '/courses/api/all/',
            'method': 'POST',
            'dataType': 'json'
        }).done(result => {
            let courses = [];
            for (let courseJSON of result)
                courses.push(Course.fromJSON(courseJSON));

            this.setState({
                courses
            }, this.updateFilteredCourses);
        });
    },

    fetchUserCourses(callback) {
        UserCourses.get(courses => {
            let userCourses = [];
            for (let course of courses)
                userCourses.push(course.getCRN());

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
            if (this.isUserCourse(course)) {
                UserCourses.remove(course, () => {
                    this.fetchUserCourses(this.forceUpdate);
                });
            } else {
                UserCourses.add(course, () => {
                    this.fetchUserCourses(this.forceUpdate);
                });
            }
        };
    },

    updateFilteredCourses() {
        if (this.state.courses !== undefined)
            setTimeout(() => {
                this.setState({
                    filtered: this.props.filterDelegate.filter(this.state.courses)
                });
            }, 0);
    },

    render() {
        let courses;
        if (this.state.filtered === undefined)
            courses = <Tr><Td column='userCourse'>Loading courses...</Td></Tr>;
        else {
            if (this.state.filtered.length === 0)
                courses = <Tr><Td column='userCourse'>No courses found</Td></Tr>;
            else
                courses = this.state.filtered.map(course => {
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

                    return (
                        <Tr key={course.getCRN()}>
                            <Td column='userCourse'
                                handleClick={this.toggleUserCourseFactory(course)}>
                                <a className={userClasses}>
                                    <span className={heartClasses} />
                                </a>
                            </Td>
                            <Td column='crn'
                                handleClick={showCourseFactory(course)}>
                                {course.getCRN()}
                            </Td>
                            <Td column='courseID'
                                handleClick={showCourseFactory(course)}>
                                {course.getCourseID()}
                            </Td>
                            <Td column='title'
                                handleClick={showCourseFactory(course)}>
                                {course.getTitle()}
                            </Td>
                            <Td column='instructor'
                                handleClick={showCourseFactory(course)}>
                                {course.getInstructor()}
                            </Td>
                            <Td column='meetings'
                                handleClick={showCourseFactory(course)}>
                                {course.getMeetings()}
                            </Td>
                            <Td column='distribution'
                                handleClick={showCourseFactory(course)}>
                                {course.getDistributionString()}
                            </Td>
                            <Td column='enrollment'
                                handleClick={showCourseFactory(course)}>
                                {course.getEnrollmentString()}
                            </Td>
                            <Td column='credits'
                                handleClick={showCourseFactory(course)}>
                                {course.getCredits()}
                            </Td>
                        </Tr>
                    );
                });
        }

        const columns = [
            { key: 'userCourse', label: '' },
            { key: 'crn', label: 'CRN' },
            { key: 'courseID', label: 'Course ID' },
            { key: 'title', label: 'Title' },
            { key: 'instructor', label: 'Instructor' },
            { key: 'meetings', label: 'Meetings' },
            { key: 'distribution', label: 'Distribution' },
            { key: 'enrollment', label: 'Enrollment' },
            { key: 'credits', label: 'Credits' }
        ];

        return (
            <div className='table-responsive'>
                <Table ref='courseTable' className='table table-hover course-table'
                       columns={columns} itemsPerPage={50}
                       sortable={true}>
                    {courses}
                </Table>
            </div>
        );
    }
});
