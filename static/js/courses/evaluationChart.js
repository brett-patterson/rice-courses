define(["exports", "module", "react", "jquery", "highcharts"], function (exports, module, _react, _jquery, _highcharts) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var jQuery = _interopRequire(_jquery);

    var Highcharts = _interopRequire(_highcharts);

    module.exports = React.createClass({
        displayName: "evaluationChart",

        componentDidMount: function componentDidMount() {
            var data = this.props.data.map(function (datum) {
                return [datum.prompt, datum.percent];
            });

            jQuery(React.findDOMNode(this.refs.chart)).highcharts({
                title: {
                    text: this.props.title
                },
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: true,
                            format: "<b>{point.name}</b>: {point.percentage:.0f}%"
                        }
                    }
                },
                series: [{
                    type: this.props.type,
                    data: data
                }]
            });
        },

        render: function render() {
            return React.createElement("div", { className: "evaluation-chart", ref: "chart" });
        }
    });
});