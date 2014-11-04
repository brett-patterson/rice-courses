$(function() {
    scheduler.skin = 'flat';

    scheduler.config.day_date = '%l'; // Display days as "Monday"
    scheduler.config.hour_date = '%h:%i %A'; // Display hours as "08:00 PM"
    scheduler.config.first_hour = 8; // Start day at 8AM

    scheduler.config.readonly_form = true; // don't allow lightbox edits to events
    scheduler.attachEvent("onBeforeDrag", function() {return false;});
    scheduler.attachEvent("onClick", function() {return false;});
    scheduler.config.details_on_dblclick = true;
    scheduler.config.dblclick_create = false;

    // hide Saturdays and Sundays
    scheduler.ignore_week = function(date) {
        if (date.getDay() == 6 || date.getDay() == 0)
            return true;
    };

    // Use Jan 1 2007, so that 1/1 falls on a Monday
    scheduler.init('scheduler', new Date(2007, 0, 1), 'week');

    var events = [
        {id:1, text:"Meeting",   start_date:"01/01/2007 14:00",end_date:"01/01/2007 17:00"},
        {id:2, text:"Conference",start_date:"01/02/2007 12:00",end_date:"01/02/2007 19:00"},
        {id:3, text:"Interview", start_date:"01/03/2007 09:00",end_date:"01/03/2007 10:00"}
    ];
    scheduler.parse(events, 'json');
});