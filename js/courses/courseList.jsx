import React from 'react';
import {Table} from 'reactable';
import jQuery from 'jquery';

import Course from 'courses/course';
import UserCourses from 'courses/userCourses';
import {makeClasses} from 'util';

export default React.createClass({
    getInitialState() {
        return {
            courses: undefined,
            userCourses: []
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
        jQuery.ajax({
            'url': '/courses/api/all/',
            'method': 'POST',
            'dataType': 'json'
        }).done(result => {
            let courses = [];
            for (let course of result)
                courses.push(Course.fromJSON(course));

            this.setState({
                courses
            });
        });
    },

    fetchUserCourses(callback) {
        UserCourses.get(courses => {
            let userCourses = [];
            for (let course of courses)
                userCourses.push(course.crn);

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

    getFilteredCourses() {
        if (this.state.courses !== undefined)
            return this.props.filterDelegate.filter(this.state.courses);
        return [];
    },

    render() {
        let courses;
        if (this.state.courses === undefined)
            courses = [{'userCourse': 'Loading courses...'}];
        else {
            const filtered = this.getFilteredCourses();

            if (filtered.length === 0)
                courses = [{'userCourse': 'No courses found'}];
            else
                courses = filtered.map(course => {
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

                    const userCourseElement = (
                        <a className={userClasses}
                           onClick={this.toggleUserCourseFactory(course)}>
                            <span className={heartClasses} />
                        </a>
                    );

                    return {
                        'userCourse': userCourseElement,
                        'crn': course.getCRN(),
                        'courseID': course.getCourseID(),
                        'title': course.getTitle(),
                        'instructor': course.getInstructor(),
                        'meetings': course.getMeetings(),
                        'distribution': course.getDistributionString(),
                        'enrollment': course.getEnrollmentString(),
                        'credits': course.getCredits()
                    };
                });
        }

        const columns = [{
            key: 'userCourse',
            label: ''
        }, {
            key: 'crn',
            label: 'CRN'
        }, {
            key: 'courseID',
            label: 'Course ID'
        }, {
            key: 'title',
            label: 'Title'
        }, {
            key: 'instructor',
            label: 'Instructor'
        }, {
            key: 'meetings',
            label: 'Meetings'
        }, {
            key: 'distribution',
            label: 'Distribution'
        }, {
            key: 'enrollment',
            label: 'Enrollment'
        }, {
            key: 'credits',
            label: 'Credits'
        }];

        return (
            <div className='table-responsive'>
                <Table ref='courseTable' className='table table-hover course-table'
                       data={courses}
                       columns={columns} itemsPerPage={50}
                       sortable={true} />
            </div>
        );
    }
});
