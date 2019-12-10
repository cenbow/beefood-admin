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

@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formVals: props.values,
      uploadLoading: false,
      imageUrl: '',
    };
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
                'value': this.state.imageUrl,
              }, () => {
                getFieldValue('value')
              });

            }
          );
        }
      });
    } else {
      this.setState({ uploadLoading: false });
    }
  };


  renderContent = (formVals) => {
    const { form: { getFieldDecorator, validateFields } } = this.props
    const { uploadLoading, imageUrl } = this.state;

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div>
        <FormItem {...formLayout} label="背景图片设置">
          {getFieldDecorator('value', {
            rules: [{ required: true, message: '请上传图片' }],
            initialValue: formVals.value,
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
              {imageUrl || formVals.value ? (
                <ShowImg src={imageUrl || formVals.value} className="avatar-80" />
              ) : (
                  uploadButton
                )}
            </Upload>
          )}
        </FormItem>

      </div>
    )

  }

  render () {
    const { form, handleAdd } = this.props
    const { formVals, imageUrl } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        console.log('fieldsValue', fieldsValue);
        const newFieldsVal = {
          id: formVals[0].id,
          value: fieldsValue.value
        }
        console.log('newFieldsVal', newFieldsVal);
        handleAdd(newFieldsVal);
      });
    };
    return (
      <div>
        {this.renderContent(formVals[0])}
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" onClick={okHandle}>
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


@connect(({ userRedPacketSet, loading }) => ({
  userRedPacketSet,
  loading: loading.effects['userRedPacketSet/fetchUserRedPacketSetInfo'],
}))
@Form.create()
class Share extends PureComponent {
  state = {
    infoData: {},
  };

  componentDidMount () {
    this.getInfo()
  }

  getInfo = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'userRedPacketSet/fetchUserRedPacketSetInfo',
      payload: null,
      callback: res => {
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        this.setState({
          infoData: data || []
        })
      },
    });
  }

  saveForm = (fields) => {
    console.log('fields', fields);
    const { dispatch } = this.props;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'userRedPacketSet/fetchEditUserRedPacketSet',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
      },
    });

  }

  render () {
    const { infoData } = this.state;
    return (
      <Fragment>
        <h3 className={styles.editTitle}>新人红包提示页面设置</h3>
        {infoData && Object.keys(infoData).length ? (
          <CreateForm handleAdd={this.saveForm}
            values={infoData}
          />
        ) : null}
      </Fragment>
    );
  }
}

export default Share;