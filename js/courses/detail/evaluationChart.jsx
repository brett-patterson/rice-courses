import React from 'react';
import Highcharts from 'highcharts';


export default React.createClass({
    propTypes: {
        data: React.PropTypes.array
    },

    getDefaultProps() {
        return {
            data: []
        };
    },

    componentDidMount() {
        let data = this.props.data.map(datum => {
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
                        format: '<b>{point.name}</b>: {point.percentage:.0f}%'
                    }
                }
            },
            series: [{
                type: this.props.type,
                data
            }]
        });
    },

    render() {
        return <div className='evaluation-chart' ref='chart' />;
    }
});
