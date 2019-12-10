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

// 邀请好友
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    // console.log(this.props);
    this.state = {
      infoData: {},
      formVals: {},
      uploadLoading: false,
      imageUrl: '',
    };
  }

  componentDidMount () {
    const { values, form } = this.props
    // console.log('values', values.value);
    if (values) {
      const data = values.value
      form.setFieldsValue({
        'icon': data.icon,
        'title': data.title,
        'address': data.address,
        'desc': data.desc,
      })
      this.setState({
        infoData: values,
        formVals: data
      }, () => {
        // console.log('state.infoData', this.state.infoData);
      })
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

  okHandle = () => {
    const { form: { getFieldDecorator, validateFields }, handleAdd } = this.props;
    const { infoData } = this.state
    validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log('fieldsValue', fieldsValue);
      const newFieldsValue = {
        id: infoData.id,
        value: JSON.stringify(fieldsValue),
        ...fieldsValue
      }
      // console.log('newFieldsValue', newFieldsValue);
      handleAdd(newFieldsValue);
    });
  };


  render () {
    const { form: { getFieldDecorator, validateFields } } = this.props
    const { formVals, uploadLoading, imageUrl } = this.state;

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <div>
        <FormItem {...formLayout} label="分享图片">
          {getFieldDecorator('icon', {
            rules: [{ required: true, message: '请上传图片' }],
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
              {imageUrl || formVals.icon ? (
                <ShowImg src={imageUrl || formVals.icon} className="avatar-80" />
              ) : (
                  uploadButton
                )}
            </Upload>
          )}
        </FormItem>
        <FormItem {...formLayout} label="分享标题">
          {getFieldDecorator('title', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="分享地址">
          {getFieldDecorator('address', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="分享描述">
          {getFieldDecorator('desc', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" onClick={this.okHandle}>
            <FormattedMessage id="form.save" />
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
            <FormattedMessage id="form.cancel" />
          </Button>
        </FormItem>
      </div>
    )

  }
};


@connect(({ shareSet, loading }) => ({
  shareSet,
  loading: loading.effects['shareSet/fetchShareSetInfo'],
}))
@Form.create()
class Share extends PureComponent {
  state = {
    editConsumerFormValues: {},
    editHorsemanFormValues: {},
    editMerchantFormValues: {},
  };

  componentDidMount () {
    const { shareSet: { data } } = this.props
    console.log('componentDidMount', data);
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
      type: 'shareSet/fetchShareSetInfo',
      payload: getParams,
      callback: res => {
        if (!utils.successReturn(res)) return;
      },
    });
  }

  saveForm = (fields) => {
    const { dispatch } = this.props;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'shareSet/fetchEditShareSet',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
      },
    });

  }

  render () {
    const { imageUrl, background_color, editConsumerFormValues, editHorsemanFormValues, editMerchantFormValues } = this.state;
    const {
      shareSet: { data },
      form: { getFieldDecorator },
      loading
    } = this.props;

    return (
      <Fragment>
        <h3 className={styles.editTitle}>邀请好友</h3>
        {data && data.consumer ? (
          <CreateForm handleAdd={this.saveForm}
            values={data.consumer}
          />
        ) : null}
        <h3 className={styles.editTitle}>邀请骑手入住</h3>
        {data && data.horseman ? (
          <CreateForm handleAdd={this.saveForm}
            values={data.horseman}
          />
        ) : null}
        <h3 className={styles.editTitle} >邀请商家入住</h3>
        {data && data.merchant ? (
          <CreateForm handleAdd={this.saveForm}
            values={data.merchant}
          />
        ) : null}
      </Fragment>
    );
  }
}

export default Share;