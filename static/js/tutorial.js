import 'tutorialize/dist/css/tutorialize.min.css';

import jQuery from 'jquery';
import Tutorialize from 'tutorialize';
import {ajax} from './util';

jQuery(() => {
    ajax({
        url: '/api/help/tutorial/',
        method: 'GET',
        data: {
            tutorial: location.pathname
        }
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
