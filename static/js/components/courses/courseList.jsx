import React, {PropTypes} from 'react';
import {Pagination, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {DragSource} from 'react-dnd';
import classNames from 'classnames';
import {List, OrderedMap} from 'immutable';

import Course from 'models/course';
import {wrapComponentClass, propTypePredicate} from 'util';

const courseSource = {
    beginDrag(props) {
        const {course} = props;
        return { course };
    }
};

function courseDragCollect(connect) {
    return {
        connectDragSource: connect.dragSource()
    };
}

let CourseRow = class CourseRow extends React.Component {
    renderScheduleBand(schedule) {
        const style = { backgroundColor: schedule.getColor() };
        const tooltip = <Tooltip id={`tooltip-${schedule.getID()}`}>
            {schedule.getName()}
        </Tooltip>;
        return <OverlayTrigger key={schedule.getID()} placement='top'
                               overlay={tooltip}>
            <span className='schedule-band' style={style}>&nbsp;</span>
        </OverlayTrigger>;
    }

    render() {
        const {
            course, schedules, connectDragSource, showCourseDetailFactory
        } = this.props;

        const onSchedules = schedules.filter(s => {
            return s.getCourses().find(c => c.equals(course));
        });

        const percent = course.getEnrollmentPercentage();
        const enrollClasses = classNames('text-center', {
            'enroll-warning': percent >= 75 && percent < 100,
            'enroll-full': percent === 100
        });

        return connectDragSource(
            <tr>
                <td>
                    {onSchedules.map(this.renderScheduleBand)}
                </td>
                <td onClick={showCourseDetailFactory(course)}>
                    {course.getCRN()}
                </td>
                <td onClick={showCourseDetailFactory(course)}>
                    {course.getCourseID()}
                </td>
                <td onClick={showCourseDetailFactory(course)}>
                    {course.getTitle()}
                </td>
                <td onClick={showCourseDetailFactory(course)}>
                    {course.getInstructor()}
                </td>
                <td onClick={showCourseDetailFactory(course)}>
                    {course.getMeetingsString()}
                </td>
                <td className='text-center'
                    onClick={showCourseDetailFactory(course)}>
                    {course.getDistributionString()}
                </td>
                <td className={enrollClasses}
                    onClick={showCourseDetailFactory(course)}>
                    {course.getEnrollmentString()}
                </td>
                <td className='text-center'
                    onClick={showCourseDetailFactory(course)}>
                    {course.getCredits()}
                </td>
            </tr>
        );
    }
};

CourseRow.propTypes = {
    course: PropTypes.instanceOf(Course).isRequired,
    schedules: propTypePredicate(List.isList),
    showCourseDetailFactory: PropTypes.func,
    connectDragSource: PropTypes.func
};

CourseRow = DragSource('COURSE', courseSource, courseDragCollect)(
    wrapComponentClass(CourseRow)
);


class CourseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            courseShown: null
        };
    }

    showCourseDetailFactory(course) {
        return () => {
            let location = `/courses/${course.getCRN()}/`;
            this.context.history.push(location);
        };
    }

    onPageClick(key) {
        this.props.pageChanged(key - 1);
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
                'text-center': center
            });

            return (
                <th className={classes} key={key}>
                    {name}
                </th>
            );
        });

        return (
            <tr>
                <th />
                {headers}
            </tr>
        );
    }

    renderCourseRows() {
        const {courses, schedules} = this.props;

        if (courses === undefined)
            return <tr><td>Loading courses...</td></tr>;
        else if (courses.count() === 0)
            return <tr><td>No courses found</td></tr>;

        return courses.map(course => (
            <CourseRow key={course.getCRN()} course={course}
                       schedules={schedules}
                       showCourseDetailFactory={this.showCourseDetailFactory}/>
        )).toArray();
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
    courses: propTypePredicate(OrderedMap.isOrderedMap, false),
    schedules: propTypePredicate(List.isList),
    page: PropTypes.number,
    totalPages: PropTypes.number,
    pageChanged: PropTypes.func,
    orderChanged: PropTypes.func
};

CourseList.contextTypes = {
    history: PropTypes.object.isRequired
};

export default wrapComponentClass(CourseList);
