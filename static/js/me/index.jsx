import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Me from './me';

jQuery(() => {
    ReactDOM.render(
        React.createElement(Me),
        document.getElementById('meContent')
    );
});
