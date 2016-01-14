import 'tutorialize/dist/css/tutorialize.min.css';

import jQuery from 'jquery';
import Tutorialize from 'tutorialize';
import {ajaxCSRF} from './util';

jQuery(() => {
    ajaxCSRF({
        url: window.TUTORIAL_URL,
        method: 'POST',
        data: {
            tutorial: location.pathname
        },
        dataType: 'json'
    }).done(data => {
        if (!data.error) {
            var tutorial = new Tutorialize(data.tutorial, data);
            window.startTutorial = () => {
                if (tutorial && tutorial.tutorial &&
                    tutorial.tutorial.length > 0)
                    tutorial.start();
            };
            jQuery('#helpButton').show();
        }
    });
});
