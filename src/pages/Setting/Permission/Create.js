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

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
@Form.create()
class PermissionCreate extends PureComponent {
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
        if (fieldsValue['icon'] == undefined || fieldsValue['icon'] == '') {
          formData.delete('icon');
        }
      });
      // 提交数据
      dispatch({
        type: 'adminSetting/fetchPermissionCreate',
        payload: formData,
        callback: res => {
          console.log(res);
          if (res.code == 200) {
            message.success('保存成功', 0.5, () => {
              this.props.history.push(`/setting/permission`);
            });
          }
        },
      });
    });
  };
  render() {
    console.log(this.props.location.query.cid);
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
        <h3 className="edit_title">新增模块</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="父权限ID">
            {getFieldDecorator('cid', {
              initialValue: this.props.location.query.cid,
              rules: [{ required: true, message: '请输入父权限ID!' }],
            })(<Input placeholder="请输入" disabled />)}
          </FormItem>
          <FormItem {...formItemLayout} label="名称">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入名称!' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="路由">
            {getFieldDecorator('path', {
              rules: [{ required: true, message: '请填写路由!' }],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="组件">
            {getFieldDecorator('component', {
              rules: [{ required: true, message: '请填写组件!' }],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="图标名称">
            {getFieldDecorator('icon', {
              // rules: [{ required: true, message: '请填写图标名称!' }],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="后台路径">
            {getFieldDecorator('url', {
              rules: [{ required: true, message: '请填写后台路径!' }],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="注释">
            {getFieldDecorator('flag', {
              rules: [{ required: true, message: '请填写注释!' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="是否是菜单">
            {getFieldDecorator('is_menu', {
              initialValue: '0',
            })(
              <Radio.Group>
                {/* {this.props.location.query.parentId == 0 ? (
                  <Radio value="1">是</Radio>
                ) : (
                  <Radio value="1" disabled>
                    是
                  </Radio>
                )} */}
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            )}
            <div>侧边导航只有两层</div>
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

export default PermissionCreate;
