import React from 'react';
import {Badge} from 'reactBootstrap';
import {Table, Tr, Td} from 'reactable';
import ZeroClipboard from 'zeroClipboard';

import {showCourseFactory} from 'courses/courseDetail';
import {makeClasses} from 'util';


export default React.createClass({
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
                'enroll-full': percent === 100
            });

            return (
                <Tr key={course.getCRN()}>
                    <Td column='shown'
                        handleClick={this.toggleCourseShownFactory(course)}>
                        <a className={buttonClass}>
                            <span className={eyeClasses} />
                        </a>
                    </Td>
                    <Td column='crn'
                        handleClick={showCourseFactory(course)}>
                        <span>
                            {course.getCRN() + ' '}
                            <a className='copy-btn'
                               data-clipboard-text={course.getCRN()}
                               onClick={this.copyButtonClicked}>
                               <span className='glyphicon glyphicon-paperclip' />
                            </a>
                        </span>
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
                    <Td column='remove' className='remove-btn'
                        handleClick={this.removeCourseFactory(course)}>
                        <span className='glyphicon glyphicon-remove' />
                    </Td>
                </Tr>
            );
        });
    },

    renderCourseTable() {
        const columns = [
            { key: 'shown', label: '' },
            { key: 'crn', label: 'CRN' },
            { key: 'courseID', label: 'Course' },
            { key: 'title', label: 'Title' },
            { key: 'instructor', label: 'Instructor' },
            { key: 'meetings', label: 'Meetings' },
            { key: 'distribution', label: 'Distribution' },
            { key: 'enrollment', label: 'Enrollment' },
            { key: 'credits', label: 'Credits' },
            { key: 'remove', label: ''}
        ];

        return (
            <div className='table-responsive'>
                <Table ref='courseTable' columns={columns}
                       className='table table-hover course-table'>
                    {this.renderCourseRows()}
                </Table>
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
