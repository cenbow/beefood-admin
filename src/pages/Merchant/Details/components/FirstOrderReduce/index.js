import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, InputNumber, DatePicker, Button, Modal, message, Radio, Alert, Icon, Divider, } from 'antd';
import utils from '@/utils/utils';

const FormItem = Form.Item;

let key_num = 0;

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.effects['merchant/fetchSaveMerchantFirstOrderReduce'],
}))
@Form.create()
class index extends Component {
  state = {
    merchant_id: '',
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    const { params } = this.props;

    this.setState({
      merchant_id: params.id
    }, () => {
      this.getInfo()
    });
  }

  getInfo = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'merchant/fetchMerchantFirstOrderReduceInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        const reduce_data = data.first_order_reduce;
        if (reduce_data) {
          key_num = 1;
          form.setFieldsValue({
            keys: [0],
          }, () => {
              form.setFieldsValue({
                [`first_order_reduce[0][id]`]: reduce_data.id,
                [`first_order_reduce[0][money]`]: utils.handleMoney(reduce_data.money, 0),
                [`first_order_reduce[0][start_time]`]: utils.setDateValue(reduce_data.start_time, 'YYYY-MM-DD'),
                [`first_order_reduce[0][end_time]`]: utils.setDateValue(reduce_data.end_time, 'YYYY-MM-DD'),
              })
          });
        }
      }
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue);
      if (!err) {
        let formData = new FormData();
        formData.append('merchant_id', this.state.merchant_id);
        formData.append('first_order_reduce_permission', fieldsValue.first_order_reduce_permission);
        // 解构数组
        let first_order_reduce_data = fieldsValue.keys.map(key => fieldsValue.first_order_reduce[key]);
        if (first_order_reduce_data.length > 0) {
          for (let i = 0; i < first_order_reduce_data.length; i++) {
            if (first_order_reduce_data[i]['id'] != '0') {
              formData.append(`first_order_reduce[${i}][id]`, first_order_reduce_data[i]['id']);
            }
            formData.append(`first_order_reduce[${i}][money]`, utils.handleMoney(first_order_reduce_data[i]['money'], 1));
            formData.append(`first_order_reduce[${i}][start_time]`, utils.getDateTime(first_order_reduce_data[i]['start_time']));
            formData.append(`first_order_reduce[${i}][end_time]`, utils.getEndDateTime(first_order_reduce_data[i]['end_time']));
          }
        } else {
          formData.delete('first_order_reduce');
        }

        // 提交表单
        dispatch({
          type: 'merchant/fetchSaveMerchantFirstOrderReduce',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('保存成功');
            // router.goBack();
          },
        });
      }
    });
  }

  render() {
    const { form, merchant: { merchantFirstOrderReduceInfo }, loading } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
    };
    const formLayout_two = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 12, offset: 3 },
    };

    // 添加多项分类事件
    const removeCategory = k => {
      const keys = getFieldValue('keys');
      // if (keys.length === 1) {
      //   // addCategory();
      //   message.info("请再新增一个，才可以删除哦")
      //   return;
      // }
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    };
    const addCategory = () => {
      const keys = getFieldValue('keys');
      const nextKeys = keys.concat(key_num++);
      form.setFieldsValue({
        keys: nextKeys,
      });
    };
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <div className="form-col-box coupon-list-box" key={k}>
        <Divider><span>规则{index + 1}</span></Divider>
        <div>
          {getFieldDecorator(`first_order_reduce[${k}][id]`, { initialValue: '0' })(
            <span></span>
          )}
          <FormItem {...formLayout_two} label="首单减免">
            {getFieldDecorator(`first_order_reduce[${k}][money]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
            })(<Input addonBefore="$" placeholder="请输入" style={{ width: 279 }} />)}
          </FormItem>
          <FormItem {...formLayout_two} label="活动时间" required>
            <FormItem style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              {getFieldDecorator(`first_order_reduce[${k}][start_time]`, {
                rules: [{ required: true, message: '必填' }],
              })(<DatePicker placeholder="开始时间" format={'YYYY-MM-DD'} />)}
            </FormItem>
            <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>至</span>
            <FormItem style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              {getFieldDecorator(`first_order_reduce[${k}][end_time]`, {
                rules: [{ required: true, message: '必填' }],
              })(<DatePicker placeholder="结束时间" format={'YYYY-MM-DD'} />)}
            </FormItem>
          </FormItem>
        </div>
        <span>
          <Icon
            className="dynamic-button"
            type="minus-circle-o"
            title="删除"
            onClick={() => removeCategory(k)}
          />
        </span>
      </div>
    ));

    return (
      <Card bordered={false}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="商家操作权限">
            {getFieldDecorator('first_order_reduce_permission', {
              initialValue: merchantFirstOrderReduceInfo.first_order_reduce_permission || 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="首单减免">
            {formItems}
            {
              keys.length == 0 && (
                <Icon
                  className="dynamic-button"
                  type="plus-circle"
                  title="新增"
                  onClick={addCategory}
                  style={{ top: 8 }}
                />
              )
            }
          </FormItem>
          <FormItem {...formLayoutWithOutLabel} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { this.getInfo() }}>取消</Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
}

export default index;