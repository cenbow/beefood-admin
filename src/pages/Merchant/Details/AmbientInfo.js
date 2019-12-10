import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import Zmage from 'react-zmage'; //放大图片
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Menu,
  Dropdown,
  Card,
  DatePicker,
  message,
  Tree,
  Upload,
  Modal,
  Icon,
} from 'antd';
import { getBase64, beforeUpload, goBack } from '@/utils/utils';
import utils from '@/utils/utils';
import { uploadImage } from '@/services/common';
import SelectStoreForm from '@/components/SelectStoreForm';
const { TreeNode } = Tree;
const FormItem = Form.Item;
const { Option } = Select;

@connect(({ mdish, common, loading }) => ({
  mdish,
  common,
  loading: loading.models.mdish,
}))
@Form.create()
class AmbientInfo extends PureComponent {
  state = {
    previewVisible: false,
    uploadLoading: false,
    envirLoading: false,
    previewImage: '',
    logoUrl: '',
    fileList: [],
    envirList: [],
    verify_status: '',
    verify_fail_message: '',
  };
  componentDidMount() {
    this.getInfo();
  }
  getInfo() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mdish/fetchMbientInfo',
      payload: {
        merchant_id: this.props.params.id,
      },
      callback: res => {
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        this.setState({
          verify_status: data.verify_status || '',
          verify_fail_message: data.verify_fail_message,
          fileList: data.facade || [],
          envirList: data.environment || [],
        });
      },
    });
  }
  handleUploadChange = (info, type) => {
    const { fileList } = this.state;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        var arr = [];
        arr = fileList;
        if (type == 'image') {
          arr.push(res.data.items.path);
          this.setState({
            fileList: arr,
          });
        }
        this.setState({
          uploadLoading: false,
        });
      }
    });
  };
  handleEnvirChange = (info, type) => {
    this.setState({ envirLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        var arr = this.state.envirList;
        if (type == 'image') {
          arr.push(res.data.items.path);
          this.setState({
            envirList: arr,
          });
        }
        this.setState({
          envirLoading: false,
        });
      }
    });
  };
  handleDelete = index => {
    var arr;
    arr = this.state.fileList;
    arr.splice(index, 1);
    this.setState({
      fileList: [...arr],
    });
  };
  handleEnvirDelete = index => {
    var arr;
    arr = this.state.envirList;
    arr.splice(index, 1);
    this.setState({
      envirList: [...arr],
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    const { fileList, envirList } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (fileList.length == 0) return message.error('请上传商家门脸照片');
      if (envirList.length == 0) return message.error('请上传环境实拍照片');
      if (err) return;
      // 提醒确认
      Modal.confirm({
        title: '保存认证信息',
        content: '保存后，修改的内容直接提交审核，直到审核结束后才可以重新修改信息，是否继续。',
        onOk: () => {
          this.postForm(fieldsValue);
        },
        onCancel() {
          return;
        },
      });
      
    });
  };

  postForm = values => {
    const { dispatch } = this.props;
    const { fileList, envirList } = this.state;
    let formData = new FormData();
    formData.append('merchant_id', this.props.params.id);
    if (fileList.length > 0) {
      fileList.forEach(item => {
        formData.append('facade[]', item);
      });
    } else {
      message.error('请提交商家门脸照片');
    }
    if (envirList.length > 0) {
      envirList.forEach(item => {
        formData.append('environment[]', item);
      });
    } else {
      message.error('请提交环境实拍图片');
    }
    // 提交数据
    dispatch({
      type: 'mdish/fetchMbientSave',
      payload: formData,
      callback: res => {
        if (res.code == 200) {
          message.success('保存成功', 0.5, () => {
            this.getInfo();
          });
        } else {
          message.error(res.msg);
        }
      },
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      common: { commonConfig },
      loading,
      location,
    } = this.props;
    const {
      previewVisible,
      previewImage,
      fileList,
      envirList,
      logoUrl,
      uploadLoading,
      envirLoading,
      verify_status,
      verify_fail_message,
    } = this.state;
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

    const formLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 18, offset: 1 },
        sm: { span: 4, offset: 4 },
      },
    };

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const envirButton = (
      <div>
        <Icon type={envirLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const formLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Fragment>
        {
          verify_status == 3 && (
            <div className="verify_status_box">
              <div className="verify_status_title">审核不通过原因</div>
              <div className="verify_status_cont">
                <p>{verify_fail_message}</p>
              </div>
            </div>
          )
        }
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="商家门脸照片">
            {getFieldDecorator('facade[]', {
              initialValue: fileList,
              rules: [{ required: true, message: '至少选择一张商家门脸照片' }],
            })(
              <div className="clearfix" style={{ marginBottom: '30px' }}>
                <div>
                  <ul style={{ paddingLeft: '0px' }}>
                    {(fileList || []).length > 0
                      ? fileList.map((item, index) => {
                        return (
                          <li
                            key={index}
                            style={{
                              width: '100px',
                              height: '100px',
                              display: 'inline-block ',
                              float: 'left',
                              marginRight: '10px',
                              position: 'relative',
                              border: '1px dashed #ccc',
                              padding: '10px',
                            }}
                          >
                            <Zmage
                              src={commonConfig.image_domain + item}
                              style={{
                                width: '80px',
                                height: '80px',
                              }}
                            />
                            <span
                              style={{
                                width: '25px',
                                height: '25px',
                                borderRadius: '50%',
                                background: '#ff6161',
                                position: 'absolute',
                                right: '-10px',
                                top: '-10px',
                                textAlign: 'center',
                                lineHeight: '25px',
                                color: '#fff',
                              }}
                              onClick={() => this.handleDelete(index)}
                            >
                              X
                              </span>
                          </li>
                        );
                      })
                      : null}
                  </ul>
                </div>
                <Upload
                  name="logo"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onPreview={this.handlePreview}
                  onChange={info => {
                    this.handleUploadChange(info, 'image');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {(fileList || []).length >= 6 ? null : uploadButton}
                </Upload>
              </div>
            )}
          </FormItem>
          <FormItem {...formLayout} label="环境实拍照片">
            {getFieldDecorator('environment[]', {
              initialValue: envirList,
              rules: [{ required: true, message: '请选择至少一张环境实拍照片' }],
            })(
              <div className="clearfix">
                <div>
                  <ul style={{ paddingLeft: '0px' }}>
                    {(envirList || []).length > 0
                      ? envirList.map((item, index) => {
                        return (
                          <li
                            key={index}
                            style={{
                              width: '100px',
                              height: '100px',
                              display: 'inline-block ',
                              float: 'left',
                              marginRight: '10px',
                              position: 'relative',
                              border: '1px dashed #ccc',
                              padding: '10px',
                            }}
                          >
                            <Zmage
                              src={commonConfig.image_domain + item}
                              style={{
                                width: '80px',
                                height: '80px',
                              }}
                            />
                            <span
                              style={{
                                width: '25px',
                                height: '25px',
                                borderRadius: '50%',
                                background: '#ff6161',
                                position: 'absolute',
                                right: '-10px',
                                top: '-10px',
                                textAlign: 'center',
                                lineHeight: '25px',
                                color: '#fff',
                              }}
                              onClick={() => this.handleEnvirDelete(index)}
                            >
                              X
                              </span>
                          </li>
                        );
                      })
                      : null}
                  </ul>
                </div>
                <Upload
                  name="logo"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onPreview={this.handlePreview}
                  onChange={info => {
                    this.handleEnvirChange(info, 'image');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {(envirList || []).length >= 6 ? null : envirButton}
                </Upload>
              </div>
            )}
          </FormItem>
          <FormItem {...formLayoutWithOutLabel} style={{ marginTop: 32 }}>
            {
              verify_status != 1 && (
                <div>
                  <Button type="primary" htmlType="submit">保存</Button>
                  <Button style={{ marginLeft: 8 }} onClick={() => { location.reload() }}>取消</Button>
                </div>
              )
            }
          </FormItem>
        </Form>
      </Fragment>
    );
  }
}

export default AmbientInfo;
