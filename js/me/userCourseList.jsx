import React from 'react';
import {Badge} from 'reactBootstrap';
import ZeroClipboard from 'zeroClipboard';

import Scheduler from 'me/scheduler';
import Course from 'courses/course';
import {showCourseFactory} from 'courses/detail/courseDetail';
import {makeClasses, propTypeHas} from 'util';


export default React.createClass({
    propTypes: {
        scheduler: React.PropTypes.instanceOf(Scheduler),
        delegate: propTypeHas(['forceUpdate', 'removeUserCourse', 'addAlert']),
        courses: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Course))
    },

    getDefaultProps() {
        return {
            courses: []
        };
    },

    componentDidUpdate(prevProps, prevState) {
        jQuery('.copy-btn').each((index, button) => {
            this.clip = new ZeroClipboard(button);
        });
    },

    toggleCourseShownFactory(course) {
        return event => {
            const scheduler = this.props.scheduler;
            if (scheduler) {
                const shown = scheduler.getMap()[course.getCRN()];
                scheduler.setCourseShown(course, !shown);
                this.forceUpdate();
                this.props.delegate.forceUpdate();
            }
        };
    },

    removeCourseFactory(course) {
        return event => {
            event.stopPropagation();
            this.props.delegate.removeUserCourse(course);              
        };
    },

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
    },

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
    },

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
    },

    buildCreditsLabel(name, vary) {
        if (vary)
            return `${name} (approximate):`;

        return `${name}:`;
    },

    getTotalCredits() {
        const distMap = this.getDistributionMap(this.props.courses);
        const distCredits = this.getDistributionCreditsString(distMap);
        const [creditsSum, vary] = this.sumCredits(this.props.courses);
        const label = this.buildCreditsLabel('Total Credits', vary);
        return [creditsSum, label, distCredits];
    },

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
    },

    copyButtonClicked(event) {
        let crn = jQuery(event.target).attr('data-clipboard-text');

        const msg = `Copied CRN <strong>${crn}</strong> to clipboard.`;
        this.props.delegate.addAlert(msg, 'success');
        event.stopPropagation();
    },

    renderCourseRows() {
        return this.props.courses.map(course => {
            let courseShown;
            if (this.props.scheduler === undefined)
                courseShown = true;
            else
                courseShown = this.props.scheduler.getMap()[course.getCRN()];

            const buttonClass = courseShown ? 'toggle-btn-show' : 'toggle-btn-hide';
            const eyeClasses = makeClasses({
                'glyphicon': true,
                'glyphicon-eye-open': courseShown,
                'glyphicon-eye-close': !courseShown
            });

            const percent = course.getEnrollmentPercentage();
            const enrollClasses = makeClasses({
                'enroll-warning': percent >= 75 && percent < 100,
                'enroll-full': percent === 100,
                'text-center': true
            });

            return (
                <tr key={course.getCRN()}>
                    <td onClick={this.toggleCourseShownFactory(course)}>
                        <a className={buttonClass}>
                            <span className={eyeClasses} />
                        </a>
                    </td>
                    <td onClick={showCourseFactory(course)}>
                        <span>
                            {course.getCRN() + ' '}
                            <a className='copy-btn'
                               data-clipboard-text={course.getCRN()}
                               onClick={this.copyButtonClicked}>
                               <span className='glyphicon glyphicon-paperclip' />
                            </a>
                        </span>
                    </td>
                    <td onClick={showCourseFactory(course)}>
                        {course.getCourseID()}
                    </td>
                    <td onClick={showCourseFactory(course)}>
                        {course.getTitle()}
                    </td>
                    <td onClick={showCourseFactory(course)}>
                        {course.getInstructor()}
                    </td>
                    <td onClick={showCourseFactory(course)}>
                        {course.getMeetingsString()}
                    </td>
                    <td  className='text-center'
                        onClick={showCourseFactory(course)}>
                        {course.getDistributionString()}
                    </td>
                    <td  className={enrollClasses}
                        onClick={showCourseFactory(course)}>
                        {course.getEnrollmentString()}
                    </td>
                    <td  className='text-center'
                        onClick={showCourseFactory(course)}>
                        {course.getCredits()}
                    </td>
                    <td className='remove-btn'
                        onClick={this.removeCourseFactory(course)}>
                        <span className='glyphicon glyphicon-remove' />
                    </td>
                </tr>
            );
        });
    },

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
    },

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
    },

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
    },

    render() {
        return (
            <div>
                {this.renderCourseTable()}
                {this.renderCourseCredits()}
            </div>
        );
    }
});
