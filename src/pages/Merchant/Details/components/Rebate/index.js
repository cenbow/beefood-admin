import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, InputNumber, Button, Modal, message, Radio, Icon, Divider } from 'antd';
import utils from '@/utils/utils';

const FormItem = Form.Item;

let key_num = 0;

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.effects['merchant/fetchSaveMerchantRebate'],
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
      type: 'merchant/fetchMerchantRebateInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        // 赋值
        let rebates_arr = data.rebates;
        let list_key = [];
        if (rebates_arr && rebates_arr.length > 0) {
          rebates_arr.forEach((el, i) => {
            list_key.push(i);
          });
          key_num = rebates_arr.length;
          form.setFieldsValue({
            keys: list_key,
          }, () => {
            rebates_arr.forEach((el, i) => {
              form.setFieldsValue({
                [`rebate_list[${i}][id]`]: el.id,
                [`rebate_list[${i}][type]`]: el.type,
                [`rebate_list[${i}][money]`]: utils.handleMoney(el.money, 0),
                [`rebate_list[${i}][valid_day]`]: el.valid_day,
                [`rebate_list[${i}][get_condition]`]: utils.handleMoney(el.get_condition, 0),
                [`rebate_list[${i}][use_condition]`]: utils.handleMoney(el.use_condition, 0),
                [`rebate_list[${i}][status]`]: el.status,
              })
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
      // console.log(fieldsValue);
      if (!err) {
        let formData = new FormData();
        formData.append('merchant_id', this.state.merchant_id);
        formData.append('rebate_permission', fieldsValue.rebate_permission);

        // 解构数组
        let rebate_list_data = fieldsValue.keys.map(key => fieldsValue.rebate_list[key]);
        if (rebate_list_data.length > 0) {
          for (let i = 0; i < rebate_list_data.length; i++) {
            if (rebate_list_data[i]['id'] != '0') {
              formData.append(`rebate_list[${i}][id]`, rebate_list_data[i]['id']);
            }
            formData.append(`rebate_list[${i}][type]`, rebate_list_data[i]['type']);
            formData.append(`rebate_list[${i}][money]`, utils.handleMoney(rebate_list_data[i]['money'], 1));
            formData.append(`rebate_list[${i}][valid_day]`, rebate_list_data[i]['valid_day']);
            formData.append(`rebate_list[${i}][get_condition]`, utils.handleMoney(rebate_list_data[i]['get_condition'], 1));
            formData.append(`rebate_list[${i}][use_condition]`, utils.handleMoney(rebate_list_data[i]['use_condition'], 1));
            formData.append(`rebate_list[${i}][status]`, rebate_list_data[i]['status']);
          }
        } else {
          formData.delete('rebate_list');
        }

        // 提交表单
        dispatch({
          type: 'merchant/fetchSaveMerchantRebate',
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
    const { form, merchant: { merchantRebateInfo }, loading } = this.props;
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
      <div className="form-col-box coupon-list-box" key={k}>
        <Divider><span>规则{index + 1}</span></Divider>
        <div>
          {getFieldDecorator(`rebate_list[${k}][id]`, { initialValue: '0' })(
            <span></span>
          )}
          <FormItem {...formLayout_two} label="代金券类型">
            {getFieldDecorator(`rebate_list[${k}][type]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: 1,
            })(
              <Radio.Group>
                <Radio value={1}>共享券</Radio>
                <Radio value={2}>互斥券</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout_two} label="代金券面额">
            {getFieldDecorator(`rebate_list[${k}][money]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
            })(<Input addonBefore="$" placeholder="请输入" style={{ width: 220 }} />)}
          </FormItem>
          <FormItem {...formLayout_two} label="有效时间">
            {getFieldDecorator(`rebate_list[${k}][valid_day]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
            })(<Input addonAfter="天" placeholder="请输入" style={{ width: 220 }} />)}
          </FormItem>
          <FormItem {...formLayout_two} label="使用条件">
            <span>
              <span>订单满</span>
              {getFieldDecorator(`rebate_list[${k}][use_condition]`, {
                rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
              })(
                <Input addonBefore="$" placeholder="请输入" style={{ width: 166, marginLeft: 12 }} />
              )}
            </span>
          </FormItem>
          <FormItem {...formLayout_two} label="获取条件">
            <span>
              <span>订单满</span>
              {getFieldDecorator(`rebate_list[${k}][get_condition]`, {
                rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
              })(
                <Input addonBefore="$" placeholder="请输入" style={{ width: 166, marginLeft: 12 }} />
              )}
            </span>
          </FormItem>
          <FormItem {...formLayout_two} label="状态">
            {getFieldDecorator(`rebate_list[${k}][status]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </div>
        <span>
          <Icon
            className="dynamic-button"
            type="plus-circle"
            title="新增"
            onClick={addCategory}
          />
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
            {getFieldDecorator('rebate_permission', {
              initialValue: (merchantRebateInfo && merchantRebateInfo.rebate_permission) || 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="返券">
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
            <Button style={{ marginLeft: 8 }} onClick={() => { form.resetFields() }}>取消</Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
}

export default index;