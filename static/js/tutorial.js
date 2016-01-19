import 'tutorialize/dist/css/tutorialize.min.css';

import jQuery from 'jquery';
import Tutorialize from 'tutorialize';
import {ajax} from './util';

jQuery(() => {
    ajax({
        url: window.TUTORIAL_URL,
        method: 'POST',
        data: {
            tutorial: location.pathname
        },
        dataType: 'json'
    }).then(data => {
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
