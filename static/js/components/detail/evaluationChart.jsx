import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Highcharts from 'highcharts';


class EvaluationChart extends React.Component {
    componentDidMount() {
        let data = this.props.data.map(datum => {
            return [datum.prompt, datum.percent];
        });

        Highcharts({
            renderTo: ReactDOM.findDOMNode(this.refs.chart),
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
    }

    render() {
        return <div className='evaluation-chart' ref='chart' />;
    }
}

EvaluationChart.propTypes = {
    data: PropTypes.array
};

EvaluationChart.defaultProps = {
    data: []
};

export default EvaluationChart;
