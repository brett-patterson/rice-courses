import React, {PropTypes} from 'react';
import {Checkbox, ControlLabel, FormGroup} from 'react-bootstrap';

import {wrapComponentClass} from 'util';

// Distribution constants to be combined in a bit vector
const ND = 0x1, D1 = 0x2, D2 = 0x4, D3 = 0x8;


class Filters extends React.Component {
    onNotFullChange(e) {
        this.props.onFilterChanged('notFull', e.target.checked);
    }

    onDistChangeFactory(dist) {
        return e => {
            let {distributions, onFilterChanged} = this.props;
            if (e.target.checked) {
                distributions |= dist;
            } else {
                distributions &= ~dist;
            }
            onFilterChanged('distributions', distributions);
        };
    }

    render() {
        const {notFull, distributions} = this.props;

        return <form>
            <h3>Filters</h3>
            <Checkbox checked={notFull}
                onChange={this.onNotFullChange}>
                Not full
            </Checkbox>

            <FormGroup>
                <ControlLabel>Distribution</ControlLabel>
                <Checkbox checked={distributions & ND}
                          onChange={this.onDistChangeFactory(ND)}>None</Checkbox>
                <Checkbox checked={distributions & D1}
                          onChange={this.onDistChangeFactory(D1)}>I</Checkbox>
                <Checkbox checked={distributions & D2}
                          onChange={this.onDistChangeFactory(D2)}>II</Checkbox>
                <Checkbox checked={distributions & D3}
                          onChange={this.onDistChangeFactory(D3)}>III</Checkbox>
            </FormGroup>
        </form>;
    }
}

Filters.propTypes = {
    notFull: PropTypes.bool,
    distributions: PropTypes.number,
    onFilterChanged: PropTypes.func
};

Filters.defaultProps = {
    notFull: false,
    distributions: ND | D1 | D2 | D3,
    onFilterChanged: () => {}
};

export default wrapComponentClass(Filters);
