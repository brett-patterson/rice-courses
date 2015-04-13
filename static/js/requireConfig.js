define(["exports"], function (exports) {
    "use strict";

    require.config({
        baseUrl: "/static/js/",
        paths: {
            babel: "../lib/requirejs-babel/babel-4.6.6.min",
            bootstrap: "../lib/bootstrap/dist/js/bootstrap",
            bootbox: "../lib/bootbox/bootbox",
            es6: "../lib/requirejs-babel/es6",
            fullcalendar: "../lib/fullcalendar/dist/fullcalendar",
            highcharts: "../lib/highcharts/highcharts",
            jquery: "../lib/jquery/dist/jquery",
            moment: "../lib/moment/moment",
            react: "../lib/react/react-with-addons",
            reactBootstrap: "../lib/react-bootstrap/react-bootstrap",
            reactable: "../lib/reactable/build/reactable",
            tutorialize: "../lib/tutorialize/dist/js/tutorialize",
            zeroClipboard: "../lib/zeroclipboard/dist/ZeroClipboard"
        },
        shim: {
            bootbox: {
                deps: ["bootstrap"]
            }
        }
    });
});