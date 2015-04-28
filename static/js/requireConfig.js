require.config({
    baseUrl: "/static/js/build/",
    paths: {
        babel: "../../lib/requirejs-babel/babel-4.6.6.min",
        bootstrap: "../../lib/bootstrap/dist/js/bootstrap",
        bootbox: "../../lib/bootbox/bootbox",
        es6: "../../lib/requirejs-babel/es6",
        highcharts: "../../lib/highcharts/highcharts",
        jquery: "../../lib/jquery/dist/jquery",
        moment: "../../lib/moment/moment",
        react: "../../lib/react/react-with-addons",
        reactBootstrap: "../../lib/react-bootstrap/react-bootstrap",
        reactable: "../../lib/reactable/build/reactable",
        reactDnd: "../../lib/react-dnd/dist/ReactDND.min",
        tutorialize: "../../lib/tutorialize/dist/js/tutorialize",
        zeroClipboard: "../../lib/zeroclipboard/dist/ZeroClipboard"
    },
    shim: {
        bootbox: {
            deps: ["bootstrap"]
        }
    }
});
