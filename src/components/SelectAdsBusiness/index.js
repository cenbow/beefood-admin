import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Row, Col, Modal, Select, Checkbox } from 'antd';
import utils from '@/utils/utils';
import {
  getCountry,
  getCity,
  getRegion,
  getBusiness,
} from '@/services/common';
const { Option } = Select;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};


// const plainOptions = ['Apple', 'Pear', 'Orange'];
// const defaultCheckedList = ['Apple', 'Orange'];


@connect(({ common }) => ({
  common,
}))
@Form.create()
export default class SelectAdsBusiness extends Component {
  static defaultProps = {
    handleSelectAdsBusiness: () => { },
    handleSelectAdsBusinessModalVisible: () => { },
    values: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      formVals: {
        key: props.values.key,
      },
      country: [],
      citys: [],
      regions: [],
      business: [],
      // plainOptions: [137, 110, 45, 25, 24],
      checkedList: [],
      // indeterminate: true,
      // checkAll: false,
    };
  }

  componentDidMount () {
    this.getCountry();
  }


  getCountry = () => {
    const { dispatch } = this.props
    //获取全部的国家
    dispatch({
      type: 'common/getCountry',
      callback: res => {
        if (res.code == 200) {
          if (res.data.items.length > 0) {
            this.setState({
              country: res.data.items
            })
          }
        }
      },
    });
  }

  selectCountry = id => {
    this.setState({
      citys: [],
      regions: [],
      business: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      city_id: undefined,
      region_id: undefined,
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        citys: undefined,
      });
      this.setState({ citys: [] });
      return;
    }
    getCity({
      country_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        citys: res.data.items,
      });
    });
  };
  selectCity = id => {
    this.setState({
      regions: [],
      business: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      region_id: undefined,
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        regions: undefined,
      });
      this.setState({ regions: [] });
      return;
    }
    getRegion({
      city_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        regions: res.data.items,
      });
    });
  };
  selectRegions = id => {
    this.setState({
      business: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        business: undefined,
      });
      this.setState({ business: [] });
      return;
    }
    getBusiness({
      region_id: id,
      is_all: 1,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        business: res.data.items,
      }, () => {
        console.log('business', this.state.business);
      });
    });
  };

  onChange = checkedList => {
    console.log('onChange', checkedList);
    this.setState({
      checkedList
    }, () => {
      console.log('checkedList', this.state.checkedList);
    });
  };

  onCheckAllChange = e => {
    const { plainOptions } = this.state
    this.setState({
      checkedList: e.target.checked ? plainOptions : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  };

  handleOk = () => {
    const { handleSelectAdsBusiness } = this.props
    const { checkedList, business } = this.state
    if (checkedList.length == 0) return message.error('请选择投放区域')
    const selectResult = business.filter(item => checkedList.indexOf(item.id) != -1)
    console.log('search:', selectResult);
    handleSelectAdsBusiness(false, selectResult)
  }
  handleCancel = () => {
    const { values, handleSelectAdsBusinessModalVisible } = this.props
    // const { targetKeys } = this.state
    // if (hasMerchantInfo) {
    //   if (targetKeys.length == 0) return message.error('请选择投放区域')
    // }
    handleSelectAdsBusinessModalVisible(false, values)
  }

  render () {
    const { selectAdsBusinessModalVisible, handleSelectAdsBusinessModalVisible, values, form, form: { getFieldDecorator },
      common } = this.props;
    const { country = [] } = common;
    const { formVals, citys, regions, business, checkedList, plainOptions } = this.state;
    return (
      <Modal
        width={660}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="选择投放区域"
        visible={selectAdsBusinessModalVisible}
        onOk={() => this.handleOk()}
        onCancel={() => this.handleCancel()}
      >
        <FormItem {...formLayout} label="国家">
          {form.getFieldDecorator('country_id', {
            initialValue: country[0] && country[0].id ? country[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectCountry(val);
              }}
            >
              {country.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="城市">
          {form.getFieldDecorator('city_id', {
            initialValue: citys[0] && citys[0].id ? citys[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectCity(val);
              }}
            >
              {citys.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="区域">
          {form.getFieldDecorator('region_id', {
            initialValue: regions[0] && regions[0].id ? regions[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectRegions(val);
              }}
            >
              {regions.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="商圈">
          {form.getFieldDecorator('business_id', {
            initialValue: business[0] && business[0].id ? business[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <div>
              {/* <div style={{ borderBottom: '1px solid #E9E9E9' }}>
                <Checkbox
                  indeterminate={this.state.indeterminate}
                  onChange={this.onCheckAllChange}
                  checked={this.state.checkAll}
                >
                  全选
              </Checkbox>
              </div> */}
              {/* <CheckboxGroup
                options={plainOptions}
                value={this.state.checkedList}
                onChange={this.onChange}
              /> */}
              {business.length > 0 ? (<Checkbox.Group style={{ width: '100%' }} onChange={this.onChange}>
                <Row type="flex" justify="start">
                  {business.map((item, i) => (
                    <Col span={8}>
                      <Checkbox value={item.id} key={i}>{item.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>) : (<div>暂无数据，请选择上述列表</div>)}
            </div>

          )}
        </FormItem>

      </Modal>
    );
  }
}
