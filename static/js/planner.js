$(function() {
    scheduler.skin = 'flat';

    scheduler.config.day_date = '%l'; // Display days as "Monday"
    scheduler.config.hour_date = '%h:%i %A'; // Display hours as "08:00 PM"
    scheduler.config.first_hour = 8; // Start day at 8AM

    scheduler.config.readonly_form = true; // don't allow lightbox edits to events
    scheduler.attachEvent("onBeforeDrag", function() {return false;});
    scheduler.attachEvent("onClick", function() {return false;});
    scheduler.attachEvent("onDblCLick", function() {return false;});
    scheduler.config.dblclick_create = false;

    // hide Saturdays and Sundays
    scheduler.ignore_week = function(date) {
        if (date.getDay() == 6 || date.getDay() == 0)
            return true;
    };

    // Use Jan 1 2007, so that 1/1 falls on a Monday
    scheduler.init('scheduler', new Date(2007, 0, 1), 'week');

    function convertTime(time) {
        return {
            hours: time.substring(0, 2),
            minutes: time.substring(2)
        };
    };

    dayMap = {
        'M': '01',
        'T': '02',
        'W': '03',
        'R': '04',
        'F': '05'
    };

    function buildDates(days, start, end) {
        var dates = [];

        var daySplit = days.split(', ');
        var startSplit = start.split(', ');
        var endSplit = end.split(', ');

        for (var i = 0; i < daySplit.length; i++) {
            var dayString = daySplit[i];
            var startTime = convertTime(startSplit[i]);
            console.log(startTime);
            var endTime = convertTime(endSplit[i]);
            console.log(endTime);

            for (var j = 0; j < dayString.length; j++) {
                var date = {};
                var day = dayString[j];

                date.start_date = '01/' + dayMap[day] + '/2007 ' + startTime.hours + ':' + startTime.minutes;
                date.end_date = '01/' + dayMap[day] + '/2007 ' + endTime.hours + ':' + endTime.minutes;

                dates.push(date);
            };
        }

        return dates;
    };

    function dataToEvents(data) {
        var events = [];

        data.forEach(function(course) {
            var dates = buildDates(course.meeting_days, course.start_time, course.end_time);

            for (var i = 0; i < dates.length; i++) {
                var courseEvent = {};
                courseEvent.id = course.crn + '_' + i;

                var courseName = course.subject + " " + course.course_number + " " + course.section;
                courseEvent.text = courseName;

                var date = dates[i];
                courseEvent.start_date = date.start_date;
                courseEvent.end_date = date.end_date;

                events.push(courseEvent);
            }
        });

        return events;
    }

    $.ajax('/accounts/api/courses/current/', {dataType: 'json'}).done(function(data) {
        scheduler.parse(dataToEvents(data), 'json');
    });
});