import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Courses from './courses';

jQuery(() => {
    ReactDOM.render(
        React.createElement(Courses),
        document.getElementById('courseList')
    );
});
