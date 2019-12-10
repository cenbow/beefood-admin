import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, InputNumber, Button, Modal, message, Radio, Alert, Icon, Divider } from 'antd';
import utils from '@/utils/utils';

const FormItem = Form.Item;

let key_num = 0;

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.effects['merchant/fetchSaveMerchantCoupon'],
}))
@Form.create()
class index extends Component {
  state = {
    merchant_id: '',
    coupons_list_data: [],
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
      type: 'merchant/fetchMerchantCouponInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        this.setState({
          coupons_list_data: data.coupons || [],
        });
        if (data.coupons && data.coupons.length > 0) {
          let coupons_list = data.coupons;
          let list_key = [];
          coupons_list.forEach((el, i) => {
            list_key.push(i);
          });
          key_num = coupons_list.length;
          form.setFieldsValue({
            keys: list_key,
          },()=>{
              coupons_list.forEach((el, i) => {
                form.setFieldsValue({
                  [`coupon_list[${i}][id]`]: el.id,
                  [`coupon_list[${i}][type]`]: el.type,
                  [`coupon_list[${i}][money]`]: utils.handleMoney(el.money, 0),
                  [`coupon_list[${i}][valid_day]`]: el.valid_day,
                  [`coupon_list[${i}][condition]`]: utils.handleMoney(el.condition, 0),
                  [`coupon_list[${i}][send_amount]`]: el.send_amount,
                  [`coupon_list[${i}][status]`]: el.status,
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
        formData.append('coupon_permission', fieldsValue.coupon_permission);

        // 解构数组
        let coupon_list_data = fieldsValue.keys.map(key => fieldsValue.coupon_list[key]);
        if (coupon_list_data.length > 0) {
          for (let i = 0; i < coupon_list_data.length; i++) {
            if (coupon_list_data[i]['id'] != '0') {
              formData.append(`coupon_list[${i}][id]`, coupon_list_data[i]['id']);
            }
            formData.append(`coupon_list[${i}][type]`, coupon_list_data[i]['type']);
            formData.append(`coupon_list[${i}][money]`, utils.handleMoney(coupon_list_data[i]['money'], 1));
            formData.append(`coupon_list[${i}][valid_day]`, coupon_list_data[i]['valid_day']);
            formData.append(`coupon_list[${i}][condition]`, utils.handleMoney(coupon_list_data[i]['condition'], 1));
            formData.append(`coupon_list[${i}][send_amount]`, coupon_list_data[i]['send_amount']);
            formData.append(`coupon_list[${i}][status]`, coupon_list_data[i]['status']);
          }
        } else {
          formData.delete('coupon_list');
        }

        // 提交表单
        dispatch({
          type: 'merchant/fetchSaveMerchantCoupon',
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
    const { form, merchant: { merchantCouponInfo }, loading } = this.props;
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
      /* if (keys.length === 1) {
        // addCategory();
        message.info("请再新增一个券，才可以删除哦")
        return;
      } */
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
          {getFieldDecorator(`coupon_list[${k}][id]`, { initialValue: '0' })(
            <span></span>
          )}
          <FormItem {...formLayout_two} label="优惠券类型">
            {getFieldDecorator(`coupon_list[${k}][type]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: 1,
            })(
              <Radio.Group>
                <Radio value={1}>共享券</Radio>
                <Radio value={2}>互斥券</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout_two} label="优惠面额">
            {getFieldDecorator(`coupon_list[${k}][money]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
            })(<Input addonBefore="$" placeholder="请输入" style={{ width: 220 }} />)}
          </FormItem>
          <FormItem {...formLayout_two} label="有效时间">
            {getFieldDecorator(`coupon_list[${k}][valid_day]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
            })(<Input addonAfter="天" placeholder="请输入" style={{ width: 220 }} />)}
          </FormItem>
          <FormItem {...formLayout_two} label="使用条件">
            <span>
              <span>订单满</span>
              {getFieldDecorator(`coupon_list[${k}][condition]`, {
                rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
              })(
                <Input addonBefore="$" placeholder="请输入" style={{ width: 166, marginLeft: 12 }} />
              )}
            </span>
          </FormItem>
          <FormItem {...formLayout_two} label="发放数量">
            {getFieldDecorator(`coupon_list[${k}][send_amount]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
            })(<Input addonAfter="张" placeholder="请输入" style={{ width: 220 }} />)}
          </FormItem>
          <FormItem {...formLayout_two} label="状态">
            {getFieldDecorator(`coupon_list[${k}][status]`, {
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
            {getFieldDecorator('coupon_permission', {
              initialValue: merchantCouponInfo.coupon_permission || 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="优惠券">
            {formItems}
            {
              keys.length == 0 && (
                <Icon
                  className="dynamic-button"
                  type="plus-circle"
                  title="新增"
                  onClick={addCategory}
                  style={{top: 8}}
                />
              )
            }
          </FormItem>
          <FormItem {...formLayoutWithOutLabel} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { this.getInfo() }}>取消</Button>
            <div className="m-t-16">
              <div className="m-b-16">
                <Alert message="优惠券类型为共享券，可与满减或折扣（限时促销）同时使用，二选一。" type="warning" />
              </div>
              <div>
                <Alert message="优惠券类型为互斥券，不可与满减或折扣（限时促销）同时使用。" type="warning" />
              </div>
            </div>
          </FormItem>
        </Form>
      </Card>
    )
  }
}

export default index;