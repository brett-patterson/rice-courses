import React from 'react';
import {Table, Tr, Td} from 'reactable';

import Course from 'courses/course';
import {showCourseFactory} from 'courses/detail/courseDetail';
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
        Course.all(courses => {
            this.setState({
                courses
            }, this.updateFilteredCourses);
        });
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

    updateFilteredCourses() {
        if (this.state.courses !== undefined)
            setTimeout(() => {
                this.setState({
                    filtered: this.props.filterDelegate.filter(this.state.courses)
                });
            }, 0);
    },

    renderCourseRows() {
        if (this.state.filtered === undefined)
            return <Tr><Td column='userCourse'>Loading courses...</Td></Tr>;
        else if (this.state.filtered.length === 0)
            return <Tr><Td column='userCourse'>No courses found</Td></Tr>;

        return this.state.filtered.map(course => {
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
                'enroll-full': percent === 100
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
                        {course.getMeetingsString()}
                    </Td>
                    <Td column='distribution'
                        handleClick={showCourseFactory(course)}>
                        {course.getDistributionString()}
                    </Td>
                    <Td column='enrollment' className={enrollClasses}
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
    },

    render() {
        const columns = [
            { key: 'userCourse', label: '' },
            { key: 'crn', label: 'CRN' },
            { key: 'courseID', label: 'Course' },
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
                    {this.renderCourseRows()}
                </Table>
            </div>
        );
    }
});
