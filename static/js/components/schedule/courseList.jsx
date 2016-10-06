import React, {PropTypes} from 'react';
import {Badge} from 'react-bootstrap';
import classNames from 'classnames';
import {List, Map} from 'immutable';

import Schedule from 'models/schedule';
import ClipboardTrigger from 'components/clipboardTrigger';
import {wrapComponentClass} from 'util';


class CourseList extends React.Component {
    toggleCourseShownFactory(course) {
        return () => {
            const {schedule, setCourseShown} = this.props;
            const shown = schedule.getMap().get(course.getCRN());
            setCourseShown(schedule, course, !shown);
        };
    }

    removeCourseFactory(course) {
        return event => {
            event.stopPropagation();
            this.props.removeCourse(this.props.schedule, course);
        };
    }

    sumCredits(courses) {
        let [total, vary] = courses.reduce((current, course) => {
            const credits = course.getCredits();
            return [
                current[0] + parseFloat(credits),
                current[1] || (credits.indexOf('to') > -1)
            ];
        }, [0, false]);

        return [total.toFixed(1), vary];
    }

    getDistributionCreditsString(distributionMap) {
        let result = '';

        for (let i = 1; i <= 3; i++) {
            const [credits, vary] = distributionMap.get(i);
            if (credits > 0) {
                const label = this.buildCreditsLabel(`D${i}`, vary);
                result += `${label} ${credits}, `;
            }
        }

        if (result.length === 0) {
            return result;
        }

        return result.slice(0, -2);
    }

    getDistributionMap(courses) {
        let courseMap = new Map([
            [1, new List()],
            [2, new List()],
            [3, new List()]
        ]);

        courseMap = courses.reduce((current, course) => {
            const distribution = course.getDistribution();
            if (distribution > 0) {
                return current.set(
                    distribution,
                    courseMap.get(distribution).push(course)
                );
            }
            return current;

        }, courseMap);

        return courseMap.map(this.sumCredits);
    }

    buildCreditsLabel(name, vary) {
        if (vary)
            return `${name} (approximate):`;

        return `${name}:`;
    }

    getTotalCredits() {
        const {schedule} = this.props;
        const courses = schedule.getCourses();

        const distMap = this.getDistributionMap(courses);
        const distCredits = this.getDistributionCreditsString(distMap);
        const [creditsSum, vary] = this.sumCredits(courses);
        const label = this.buildCreditsLabel('Total Credits', vary);

        return [creditsSum, label, distCredits];
    }

    getCreditsShown() {
        const {schedule} = this.props;

        const map = schedule.getMap();
        const courses = schedule.getCourses().filter(course => {
            return map[course.getCRN()];
        });

        const distMap = this.getDistributionMap(courses);
        const distCredits = this.getDistributionCreditsString(distMap);
        const [creditsSum, vary] = this.sumCredits(courses);
        const label = this.buildCreditsLabel('Credits Shown', vary);

        return [creditsSum, label, distCredits];
    }

    showCourseFactory(course) {
        return () => {
            let location = `/me/${course.getCRN()}/`;
            this.context.history.push(location);
        };
    }

    renderCourseRows() {
        const {schedule} = this.props;

        return schedule.getCourses().map(course => {
            const courseShown = schedule.getMap().get(course.getCRN());

            const buttonClass = courseShown ? 'toggle-btn-show' : 'toggle-btn-hide';
            const eyeClasses = classNames('glyphicon', {
                'glyphicon-eye-open': courseShown,
                'glyphicon-eye-close': !courseShown
            });

            const percent = course.getEnrollmentPercentage();
            const enrollClasses = classNames('text-center', {
                'enroll-warning': percent >= 75 && percent < 100,
                'enroll-full': percent === 100
            });

            return (
                <tr key={course.getCRN()}>
                    <td onClick={this.toggleCourseShownFactory(course)}>
                        <a className={buttonClass}>
                            <span className={eyeClasses} />
                        </a>
                    </td>
                    <td onClick={this.showCourseFactory(course)}>
                        <span>
                            {course.getCRN() + ' '}
                            <ClipboardTrigger text={course.getCRN()} onClick={e => e.stopPropagation()}>
                               <span className='glyphicon glyphicon-paperclip' />
                            </ClipboardTrigger>
                        </span>
                    </td>
                    <td onClick={this.showCourseFactory(course)}>
                        {course.getCourseID()}
                    </td>
                    <td onClick={this.showCourseFactory(course)}>
                        {course.getTitle()}
                    </td>
                    <td onClick={this.showCourseFactory(course)}>
                        {course.getInstructor()}
                    </td>
                    <td onClick={this.showCourseFactory(course)}>
                        {course.getMeetingsString()}
                    </td>
                    <td  className='text-center'
                        onClick={this.showCourseFactory(course)}>
                        {course.getDistributionString()}
                    </td>
                    <td  className={enrollClasses}
                        onClick={this.showCourseFactory(course)}>
                        {course.getEnrollmentString()}
                    </td>
                    <td  className='text-center'
                        onClick={this.showCourseFactory(course)}>
                        {course.getCredits()}
                    </td>
                    <td className='remove-btn'
                        onClick={this.removeCourseFactory(course)}>
                        <span className='glyphicon glyphicon-remove' />
                    </td>
                </tr>
            );
        }).toArray();
    }

    renderCourseHeaders() {
        return (
            <tr>
                <th></th>
                <th>CRN</th>
                <th>Course</th>
                <th>Title</th>
                <th>Instructor</th>
                <th>Meetings</th>
                <th className='text-center'>Distribution</th>
                <th className='text-center'>Enrollment</th>
                <th className='text-center'>Credits</th>
            </tr>
        );
    }

    renderCourseCredits() {
        const [creditsShown, shownLabel, shownDist] = this.getCreditsShown();
        const [totalCredits, totalLabel, totalDist] = this.getTotalCredits();

        return (
            <div className='course-credits'>
                <div>{shownLabel} <strong>{creditsShown}</strong><br/>
                    <Badge>{shownDist}</Badge></div>
                <div>{totalLabel} <strong>{totalCredits}</strong><br/>
                    <Badge>{totalDist}</Badge></div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className='table-responsive'>
                    <table className='table table-hover course-table'>
                        <thead>
                            {this.renderCourseHeaders()}
                        </thead>
                        <tbody>
                            {this.renderCourseRows()}
                        </tbody>
                    </table>
                </div>

                {this.renderCourseCredits()}
            </div>
        );
    }
}

CourseList.propTypes = {
    schedule: PropTypes.instanceOf(Schedule).isRequired,
    setCourseShown: PropTypes.func,
    removeCourse: PropTypes.func
};

CourseList.defaultProps = {
    setCourseShown: () => {},
    removeCourse: () => {}
};

CourseList.contextTypes = {
    history: PropTypes.object.isRequired
};

export default wrapComponentClass(CourseList);
