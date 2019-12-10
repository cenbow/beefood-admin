import React, { Component, Fragment } from 'react';
import { Select, } from 'antd';

const { Option } = Select;

class PrefixSelector extends Component {
  static defaultProps = {
    value: '855',
  };
  render() {
    const { form, value } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Fragment>
        {
          getFieldDecorator('mobile_prefix', {
            initialValue: value || '855',
          })(
            <Select style={{ width: 76 }}>
              <Option value="855">+855</Option>
              <Option value="86">+86</Option>
            </Select>,
          )
        }
      </Fragment>
    )
  }
}

export default PrefixSelector;