import React from 'react';
import {Button} from 'reactBootstrap';

import {hsvToRgb, rgbToHex} from 'util';

export default React.createClass({
    /**
     * Get the appropriate color for the filter button.
     * @param {number} h - The hue for the color
     * @param {boolean} darken - Whether or not to darken the color slightly
     * @return {string} An HTML hex color string
     */
    getColor(h, darken=false) {
        const v = darken === true ? 0.75 : 0.85;
        return rgbToHex(...hsvToRgb(h, 1, v));
    },

    getInitialState() {
        return {
            darken: false
        };
    },

    darken() {
        this.setState({
            darken: true
        });
    },

    lighten() {
        this.setState({
            darken: false
        });
    },

    fired() {
        if (this.props.delegate) {
            this.props.delegate.addFilter(this.props.filter, '');
        }
    },

    render() {
        let style = {
            backgroundColor: this.getColor(this.props.hue, this.state.darken)
        };

        return (
            <button className='btn btn-filter' style={style}
                    onMouseEnter={this.darken} onMouseLeave={this.lighten}
                    onClick={this.fired} >
                {this.props.filter.getName()}
            </button>
        );
    }
});
