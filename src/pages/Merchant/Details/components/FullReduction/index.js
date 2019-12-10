import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, InputNumber, DatePicker, Button, Modal, message, Radio, Alert, Icon, Divider } from 'antd';
import utils from '@/utils/utils';

const FormItem = Form.Item;

let key_num = 0;
let rule_key_num = 1;

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.effects['merchant/fetchSaveMerchantFullReduction'],
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
      type: 'merchant/fetchMerchantFullReductionInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        // 赋值
        form.setFieldsValue({
          'full_reduction_permission': data.full_reduction_permission,
        })
        const full_reductions_data = data.full_reductions;
        if (full_reductions_data && full_reductions_data.length > 0) {
          let ruleKeys = [];
          full_reductions_data.forEach((element,i) => {
            ruleKeys.push(i);
          });
          key_num = 1;
          rule_key_num = full_reductions_data.length;
          form.setFieldsValue({
            keys: [0],
          }, () => {
              form.setFieldsValue({
                ruleKeys: ruleKeys,
              }, () => {
                // 满减规则
                for (let i = 0; i < full_reductions_data.length; i++) {
                  form.setFieldsValue({
                    [`full_reduction_list[0][start_time]`]: utils.setDateValue(full_reductions_data[i].start_time, 'YYYY-MM-DD'),
                    [`full_reduction_list[0][end_time]`]: utils.setDateValue(full_reductions_data[i].end_time, 'YYYY-MM-DD'),
                    [`full_reduction_list[0][rule_list][${i}][id]`]: full_reductions_data[i].id,
                    [`full_reduction_list[0][rule_list][${i}][reach_money]`]: utils.handleMoney(full_reductions_data[i].reach_money, 0),
                    [`full_reduction_list[0][rule_list][${i}][cut_money]`]: utils.handleMoney(full_reductions_data[i].cut_money, 0),
                  })
                }
              });
          });
        }
      }
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      console.log(fieldsValue);
      if (!err) {
        let formData = new FormData();
        formData.append('merchant_id', this.state.merchant_id);
        formData.append('full_reduction_permission', fieldsValue.full_reduction_permission);
        // 解构数组
        let full_reduction_data = fieldsValue.keys.map(key => fieldsValue.full_reduction_list[key]);
        if (full_reduction_data.length > 0) {
          // 这里是按照满减规则的数量一起同传时间
          let rule_list_data = fieldsValue.ruleKeys.map(key => full_reduction_data[0].rule_list[key]);
          for (let i = 0; i < rule_list_data.length; i++) {
            if (rule_list_data[i]['id'] != '0') {
              formData.append(`full_reduction_list[${i}][id]`, rule_list_data[i]['id']);
            }
            formData.append(`full_reduction_list[${i}][start_time]`, utils.getDateTime(full_reduction_data[0]['start_time']));
            formData.append(`full_reduction_list[${i}][end_time]`, utils.getEndDateTime(full_reduction_data[0]['end_time']));
            formData.append(`full_reduction_list[${i}][reach_money]`, utils.handleMoney(rule_list_data[i]['reach_money'], 1));
            formData.append(`full_reduction_list[${i}][cut_money]`, utils.handleMoney(rule_list_data[i]['cut_money'], 1));
          }
        } else {
          formData.delete('full_reduction_list');
        }

        // 提交表单
        dispatch({
          type: 'merchant/fetchSaveMerchantFullReduction',
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

  renderRule = (key) => {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    // 添加多项分类事件
    const removeCategory = k => {
      const keys = getFieldValue('ruleKeys');
      if (keys.length === 1) {
        message.info("必填选项哦");
        return;
      }
      form.setFieldsValue({
        ruleKeys: keys.filter(key => key !== k),
      });
    };
    const addCategory = () => {
      const keys = getFieldValue('ruleKeys');
      const nextKeys = keys.concat(rule_key_num++);
      form.setFieldsValue({
        ruleKeys: nextKeys,
      });
    };
    getFieldDecorator('ruleKeys', { initialValue: [0] });
    const keys = getFieldValue('ruleKeys');
    const formItems = keys.map((k, index) => (
      <div key={k} style={{ position: 'relative' }}>
        <div>
          {getFieldDecorator(`full_reduction_list[${key}][rule_list][${k}][id]`, { initialValue: '0' })(
            <span></span>
          )}
          <FormItem style={{ display: 'inline-block', width: '56%' }}>
            <span>
              <span>订单满</span>
              {getFieldDecorator(`full_reduction_list[${key}][rule_list][${k}][reach_money]`, {
                rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
              })(
                <Input addonBefore="$" placeholder="请输入" style={{ width: 100, marginLeft: 12 }} />
              )}
            </span>
          </FormItem>
          <FormItem style={{ display: 'inline-block', width: '44%' }}>
            <span>
              <span style={{ padding: '0 6px' }}>减</span>
              {getFieldDecorator(`full_reduction_list[${key}][rule_list][${k}][cut_money]`, {
                rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
              })(
                <Input addonBefore="$" placeholder="请输入" style={{ width: 100 }} />
              )}
            </span>
          </FormItem>
        </div>
        <span>
          {
            keys.length == index + 1 && (
              <Icon
                className="dynamic-button"
                type="plus-circle"
                title="新增"
                onClick={addCategory}
              />
            )
          }
          <Icon
            className="dynamic-button"
            type="minus-circle-o"
            title="删除"
            onClick={() => removeCategory(k)}
          />
        </span>
      </div>
    ));
    return formItems;
  }

  render() {
    const { form } = this.props;
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
      <div className="form-col-box coupon-list-box" key={k} style={{width: 500, paddingRight: 48,}}>
        <Divider><span>规则{index + 1}</span></Divider>
        <div>
          <FormItem {...formLayout_two} label="有效时间" required>
            <FormItem style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              {getFieldDecorator(`full_reduction_list[${k}][start_time]`, {
                rules: [{ required: true, message: '必填' }],
              })(<DatePicker placeholder="开始时间" />)}
            </FormItem>
            <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>至</span>
            <FormItem style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              {getFieldDecorator(`full_reduction_list[${k}][end_time]`, {
                rules: [{ required: true, message: '必填' }],
              })(<DatePicker placeholder="结束时间" />)}
            </FormItem>
          </FormItem>
          <FormItem {...formLayout_two} label="满减规则" required>
            {this.renderRule(k)}
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
            {getFieldDecorator('full_reduction_permission', {
              initialValue: 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="满减">
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
            <Button type="primary" htmlType="submit">保存</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { this.getInfo() }}>取消</Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
}

export default index;