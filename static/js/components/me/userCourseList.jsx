import React, {PropTypes} from 'react';
import reactMixin from 'react-mixin';
import {Badge} from 'react-bootstrap';
import classNames from 'classnames';

import Scheduler from './scheduler';
import Course from 'models/course';
import CourseDetailMixin from 'components/courses/detail/courseDetail';
import ClipboardTrigger from 'components/clipboardTrigger';
import {propTypeHas, wrapComponentClass} from 'util';


class UserCourseList extends React.Component {
    toggleCourseShownFactory(course) {
        return () => {
            const scheduler = this.props.scheduler;
            if (scheduler) {
                const shown = scheduler.getMap()[course.getCRN()];
                scheduler.setCourseShown(course, !shown).then(() => {
                    this.forceUpdate();
                    this.props.delegate.forceUpdate();
                });
            }
        };
    }

    removeCourseFactory(course) {
        return event => {
            event.stopPropagation();
            this.props.delegate.removeUserCourse(course);
        };
    }

    sumCredits(courses) {
        let vary = false;
        let total = 0;

        for (let i = 0; i < courses.length; i++) {
            const credits = courses[i].getCredits();

            if (credits.indexOf('to') > -1)
                vary = true;

            total += parseFloat(credits);
        }

        return [total.toFixed(1), vary];
    }

    getDistributionCreditsString(distributionMap) {
        let result = '';

        for (let i = 1; i <= 3; i++) {
            const [credits, vary] = distributionMap[i];
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
        let courseMap = {
            1: [],
            2: [],
            3: []
        };

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const distribution = course.getDistribution();

            if (distribution > 0) {
                courseMap[distribution].push(course);
            }
        }

        return {
            1: this.sumCredits(courseMap[1]),
            2: this.sumCredits(courseMap[2]),
            3: this.sumCredits(courseMap[3])
        };
    }

    buildCreditsLabel(name, vary) {
        if (vary)
            return `${name} (approximate):`;

        return `${name}:`;
    }

    getTotalCredits() {
        const distMap = this.getDistributionMap(this.props.courses);
        const distCredits = this.getDistributionCreditsString(distMap);
        const [creditsSum, vary] = this.sumCredits(this.props.courses);
        const label = this.buildCreditsLabel('Total Credits', vary);
        return [creditsSum, label, distCredits];
    }

    getCreditsShown() {
        let courses = [];

        if (this.props.scheduler !== undefined) {
            const map = this.props.scheduler.getMap();
            courses = this.props.courses.filter(course => {
                return map[course.getCRN()];
            });
        }

        const distMap = this.getDistributionMap(courses);
        const distCredits = this.getDistributionCreditsString(distMap);
        const [creditsSum, vary] = this.sumCredits(courses);
        const label = this.buildCreditsLabel('Credits Shown', vary);

        return [creditsSum, label, distCredits];
    }

    showCourseFactory(course) {
        return () => {
            this.showCourseDetail(course);
        };
    }

    renderCourseRows() {
        return this.props.courses.map(course => {
            let courseShown;
            if (this.props.scheduler === undefined)
                courseShown = true;
            else
                courseShown = this.props.scheduler.getMap()[course.getCRN()];

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
        });
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

    renderCourseTable() {
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
            </div>
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
                {this.renderCourseTable()}
                {this.renderCourseCredits()}
                {this.renderCourseDetails(this.props.courses)}
            </div>
        );
    }
}

UserCourseList.propTypes = {
    scheduler: PropTypes.instanceOf(Scheduler),
    delegate: propTypeHas(['forceUpdate', 'removeUserCourse', 'addAlert']),
    courses: PropTypes.arrayOf(PropTypes.instanceOf(Course))
};

UserCourseList.defaultProps = {
    courses: []
};

reactMixin.onClass(UserCourseList, CourseDetailMixin);

export default wrapComponentClass(UserCourseList);