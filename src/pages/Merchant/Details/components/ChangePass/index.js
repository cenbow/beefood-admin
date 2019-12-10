import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button, Modal, message } from 'antd';
import utils from '@/utils/utils';

const FormItem = Form.Item;

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.models.merchant,
}))
@Form.create()
class index extends Component {
  state = {
    merchant_id: '',
    merchant_data: {
      name_cn: '',
      mobile_prefix: '',
      mobile: '',
    },
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
    const { dispatch, form, merchant } = this.props;
    if (Object.keys(merchant.basicInfo).length > 0) {
      let data = merchant.basicInfo;
      this.setState({
        merchant_data: {
          name_cn: data.m_user_info.name_cn,
          mobile_prefix: data.mobile_prefix,
          mobile: data.mobile,
        }
      });
      return;
    };
    dispatch({
      type: 'merchant/fetchBasicInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        this.setState({
          merchant_data: {
            name_cn: data.m_user_info.name_cn,
            mobile_prefix: data.mobile_prefix,
            mobile: data.mobile,
          }
        });
      }
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      // console.log(values);
      if (!err) {
        let formData = new FormData();
        Object.keys(values).forEach(key => {
          formData.append(key, values[key] || '');
        });
        // 商家id
        formData.append('merchant_id', this.state.merchant_id);
        // 提交表单
        dispatch({
          type: 'merchant/fetchMerchantChangePass',
          payload: formData,
          callback: res => {
            this.setState({ submitLoading: false });
            if (!utils.successReturn(res)) return;
            message.success('保存成功');
          },
        });
      }
    });
  }

  render() {
    const { form, loading } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { merchant_data } = this.state;

    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 8 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 8, offset: 3 },
    };

    return (
      <Card bordered={false} loading={loading}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="商家名称">
            <span>{merchant_data.name_cn}</span>
          </FormItem>
          <FormItem {...formLayout} label="商家登录手机号">
            <span>{merchant_data.mobile && ('+' + merchant_data.mobile_prefix + ' ' + merchant_data.mobile)}</span>
          </FormItem>
          <FormItem {...formLayout} label="输入新密码">
            {getFieldDecorator('new_password', {
              rules: [
                { required: true, whitespace: true, message: '密码由6-18位的字母加数字组成', min: 6, max: 18 },
              ],
            })(<Input.Password placeholder="请输入" autoComplete="off" style={{ width: 320 }} />)}
          </FormItem>
          <FormItem {...formLayout} label="确认新密码" extra={'注意：修改成功后会短信通知商家手机号，并通知该商家的BD人员'}>
            {getFieldDecorator('confirm_password', {
              rules: [
                { required: true, whitespace: true, message: '密码由6-18位的字母加数字组成', min: 6, max: 18 },
                {
                  validator: (_, value, callback) => {
                    if (value.length >= 6 && value != getFieldValue('new_password')) {
                      callback('新密码和确认密码不一致')
                    } else {
                      callback()
                    }
                  }
                }
              ],
            })(<Input.Password placeholder="请输入" autoComplete="off" style={{ width: 320 }} />)}
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

export default index