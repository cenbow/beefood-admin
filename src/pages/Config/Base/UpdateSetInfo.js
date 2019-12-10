import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, message } from 'antd';
import utils, { getBase64, beforeUpload } from '@/utils/utils';
import ShowImg from '@/components/showImg';
import { uploadImage } from '@/services/common'; // 上传图片

import styles from '../Config.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

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

// Form表单
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      infoData: {},
      formVals: {},
      uploadLoading: false,
      imageUrl: '',
    };

  }

  componentDidMount () {
    const { values, form } = this.props
    console.log('values123', values);
    if (values) {
      // for (let i = 0; i < values.length; i++) {
      //   const element = values[i];
      //   console.log('element', element.value);


      // }

      // form.setFieldsValue({
      //   'icon': data.icon,
      //   'title': data.title,
      //   'address': data.address,
      //   'desc': data.desc,
      // })
      // this.setState({
      //   infoData: values,
      //   formVals: data
      // }, () => {
      //   // console.log('state.infoData', this.state.infoData);
      // })
    }

  }

  handleUploadChange = info => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    if (beforeUpload(info.file)) {
      uploadImage(formData).then(res => {
        if (res && res.code == 200) {
          this.setState(
            {
              imageUrl: res.data.items.path,
              uploadLoading: false,
            },
            () => {
              console.log('123', this.state.imageUrl);
              setFieldsValue({
                'icon': this.state.imageUrl,
              }, () => {
                getFieldValue('icon')
              });

            }
          );
        }
      });
    } else {
      this.setState({ uploadLoading: false });
    }
  };

  normFile = e => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  render () {
    const { form, handleAdd, isConsumer } = this.props;
    const { formVals, uploadLoading, imageUrl } = this.state;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleAdd(fieldsValue);
      });
    };

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <div>
        <FormItem {...formLayout} label="客服电话">
          {form.getFieldDecorator('tel', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="安卓版本号">
          {form.getFieldDecorator('version', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="安卓版本编号">
          {form.getFieldDecorator('version_num', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="安卓更新内容">
          {form.getFieldDecorator('description', {
            rules: [{ required: true, message: '必填' }],
          })(<Input.TextArea rows={6} placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="安卓强制更新">
          {form.getFieldDecorator('status', {
            rules: [{ required: true, message: '必填' }],
            initialValue: '1'
          })(
            <Radio.Group>
              <Radio value="1">是</Radio>
              <Radio value="2">否</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem {...formLayout} label="安卓下载地址">
          {form.getFieldDecorator('url', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="ios版本号">
          {form.getFieldDecorator('ios_version', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="ios更新内容">
          {form.getFieldDecorator('ios_description', {
            rules: [{ required: true, message: '必填' }],
          })(<Input.TextArea rows={6} placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="ios强制更新">
          {form.getFieldDecorator('ios_status', {
            rules: [{ required: true, message: '必填' }],
            initialValue: '1'
          })(
            <Radio.Group>
              <Radio value="1">是</Radio>
              <Radio value="2">否</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem {...formLayout} label="ios下载地址">
          {form.getFieldDecorator('ios_url', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        {
          isConsumer ? (
            <FormItem {...formLayout} label="用户引导广告">
              {form.getFieldDecorator('ios_ad', {
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
                  onChange={info => {
                    this.handleUploadChange(info);
                  }}
                  accept="image/png, image/jpeg, image/jpg"
                >
                  {/* || formVals.ios_ad */}
                  {imageUrl ? (
                    <ShowImg src={imageUrl} className="avatar-80" />
                  ) : (
                      uploadButton
                    )}
                </Upload>
              )}
            </FormItem>
          ) : null
        }
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" onClick={okHandle}>
            <FormattedMessage id="form.save" />
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
            <FormattedMessage id="form.cancel" />
          </Button>
        </FormItem>
      </div>
    );
  }
};



@connect(({ updateSet, loading }) => ({
  updateSet,
  loading: loading.effects['updateSet/fetchUpdateSetInfo'],
}))
@Form.create()
class UpdateSetInfo extends PureComponent {
  state = {
    editConsumerFormValues: {},
    editHorsemanFormValues: {},
    editMerchantFormValues: {},
  };

  componentDidMount () {
    const { updateSet: { data } } = this.props
    console.log('componentDidMount 详情', data);
    this.setState({
      editConsumerFormValues: data.consumer,
      editHorsemanFormValues: data.horseman,
      editMerchantFormValues: data.merchant
    }, () => {
      this.getInfo()
    })
  }

  getInfo = (params) => {
    const { dispatch } = this.props
    let getParams = {
      ...params
    }
    dispatch({
      type: 'updateSet/fetchUpdateSetInfo',
      payload: getParams,
      callback: res => {
        if (!utils.successReturn(res)) return;
        // this.setState({
        //   editConsumerFormValues: res.items.consumer,
        //   editHorsemanFormValues: res.items.horseman,
        //   editMerchantFormValues: res.items.merchant,
        // }, () => {
        //   console.log(this.state.editConsumerFormValues);
        // });
      },
    });
  }

  saveForm = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      console.log(values);
      // this.getUserList(values);
    });
  }

  render () {
    const { imageUrl, background_color, editConsumerFormValues, editHorsemanFormValues, editMerchantFormValues } = this.state;
    const {
      updateSet: { data },
      form: { getFieldDecorator },
      loading
    } = this.props;

    return (
      <Fragment>
        <h3 className={styles.editTitle}>商家端APP设置</h3>
        {data && data.merchant ? (
          <CreateForm handleAdd={this.saveForm}
            values={data.merchant}
          />
        ) : null}
        <h3 className={styles.editTitle}>用户端APP设置</h3>
        {data && data.consumer ? (
          <CreateForm
            isConsumer
            handleAdd={this.saveForm}
            values={data.consumer}
          />
        ) : null}
        <h3 className={styles.editTitle}>骑手端APP设置</h3>
        {data && data.horseman ? (
          <CreateForm
            isConsumer
            handleAdd={this.saveForm}
            values={data.horseman}
          />
        ) : null}
      </Fragment>
    );
  }
}

export default UpdateSetInfo;