import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Icon,
  Menu,
  Dropdown,
  Card,
  DatePicker,
  Radio,
  Checkbox,
  message,
} from 'antd';
import { getBase64, beforeUpload } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
const { TextArea } = Input;
const FormItem = Form.Item;
@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
@Form.create()
class RoleCreate extends PureComponent {
  state = {
    formValues: {},
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let formData = new FormData();
      Object.keys(fieldsValue).forEach(key => {
        formData.append(key, fieldsValue[key]);
      });
      // 提交数据
      dispatch({
        type: 'adminSetting/fetchRoleCreate',
        payload: formData,
        callback: res => {
          if (res.code == 200) {
            message.success('保存成功', 0.5, () => {
              this.props.history.push(`/setting/role`);
            });
          } else if (res.code == 400) {
            message.error('描述字数不能超80字符串');
            return;
          } else {
            message.error(res.msg);
            return;
          }
        },
      });
    });
  };
  render() {
    const { formValues } = this.state;
    const {
      list: { list },
      form: { getFieldDecorator },
      loading,
    } = this.props;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 6 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 6, offset: 3 },
      },
    };
    return (
      <Fragment>
        <h3 className="edit_title">新增角色</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="中文角色名称">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入角色名称！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="描述">
            {getFieldDecorator('label', {
              rules: [{ required: true, message: '请输入描述！' }],
            })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
            <span>长度不超过80个字符串</span>
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">
              <FormattedMessage id="form.save" />
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                router.goBack();
              }}
            >
              <FormattedMessage id="form.cancel" />
            </Button>
          </FormItem>
        </Form>
      </Fragment>
    );
  }
}

export default RoleCreate;
