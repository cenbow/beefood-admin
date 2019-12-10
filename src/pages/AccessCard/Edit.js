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
  Upload,
} from 'antd';
import { getBase64, beforeUpload, } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
import utils from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
@Form.create()
class AccessCardEdit extends PureComponent {
  state = {
    formValues: {},
    uploadLoading: false,
    urlTypeView: 1,
    selectStoreModalVisible: false,
    imageUrl: '',
  };

  saveForm = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      console.log(values);
      // this.getUserList(values);
    });
  };

  onChangeUrlType = e => {
    console.log('UrlType event:', e);
    this.setState({
      urlTypeView: e,
    });
    return e;
  };

  handleSelectStoreModalVisible = (flag, record) => {
    this.setState({
      selectStoreModalVisible: !!flag,
      formValues: record || {},
    });
  };

  handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          uploadLoading: false,
        })
      );
    }
  };

  normFile = e => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  render() {
    const { imageUrl, urlTypeView, formValues } = this.state;
    const {
      list: { list },
      form,
      loading,
    } = this.props;
    const { getFieldDecorator } = form;

    const formLayout = {
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

    const uploadButton = (
      <div>
        <Icon type={this.state.uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">
            <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => router.goBack()}
            />{' '}
            编辑出入证
          </span>
        </div>
        <Form onSubmit={this.saveForm}>
          <FormItem {...formLayout} label="启用状态">
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '必填' }],
              initialValue: '1',
            })(
              <Radio.Group>
                <Radio value="1">启动</Radio>
                <Radio value="2">禁用</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label="赌场LOGO"
            extra="支持.png .jpg .gif格式,大小限制300K以内"
          >
            {getFieldDecorator('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })(
              <Upload
                name="banner"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {
                  return false;
                }}
                onChange={this.handleUploadChange}
                accept="image/png, image/jpeg"
              >
                {imageUrl ? (
                  <img src={imageUrl} width="86" height="86" alt="banner" />
                ) : (
                  uploadButton
                )}
              </Upload>
            )}
          </FormItem>
          <FormItem {...formLayout} label="赌场名称">
            {getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a
                onClick={() => {
                  utils.translator(form, 'name');
                }}
              >
                翻译
              </a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文赌场名称">
            {getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文赌场名称">
            {getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="赌场地址">
            {getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input.Search enterButton placeholder="请输入" />)}
          </FormItem>
          <FormItem {...submitFormLayout}>
            <div>显示地图</div>
          </FormItem>
          <FormItem {...formLayout} label="公司名称">
            {getFieldDecorator('company_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a
                onClick={() => {
                  utils.translator(form, 'company');
                }}
              >
                翻译
              </a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文公司名称">
            {getFieldDecorator('company_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文公司名称">
            {getFieldDecorator('company_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="有效时间">
            <Form.Item
              style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginBottom: 0 }}
            >
              {getFieldDecorator('start_time')(<DatePicker style={{ width: '100%' }} />)}
            </Form.Item>
            <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
            <Form.Item
              style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginBottom: 0 }}
            >
              {getFieldDecorator('end_time')(<DatePicker style={{ width: '100%' }} />)}
            </Form.Item>
          </FormItem>
          <FormItem {...formLayout} label="选择骑手">
            {getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
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
      </Card>
    );
  }
}

export default AccessCardEdit;
