import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button, Modal, message, Row, Col, Icon, Select, Upload } from 'antd';
import { beforeUpload } from '@/utils/utils';
import utils from '@/utils/utils';
import { uploadImage } from '@/services/common';
import configVar from '@/utils/configVar';
import Zmage from 'react-zmage'; //放大图片

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ merchant, common, loading }) => ({
  merchant,
  common,
  loading: loading.models.merchant,
}))
@Form.create()
class AuthInfo extends Component {

  state = {
    merchant_id: '',
    uploadLoading1: false,
    uploadLoading2: false,
    uploadLoading3: false,
    id_image_list: [],
    license_image_list: [],
    contract_image_list: [],
    verify_status: '0',
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const { params } = this.props;

    this.setState({
      merchant_id: params.id
    },() => {
      this.getInfo()
    });
  }

  getInfo = () =>{
    // merchant/fetchMerchantAuthInfo
    const { dispatch,form } = this.props;
    dispatch({
      type: 'merchant/fetchMerchantAuthInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        // verify_status认证状态：0未提交认证， 1审核中， 2通过， 3不通过， 为1时审核中不能修改
        this.setState({
          verify_status: data.verify_status,
          id_image_list: data.id_image,
          license_image_list: data.license_image,
          contract_image_list: data.contract_image,
        });
        form.setFieldsValue({
          'id_name': data.id_name,
          'id_card': data.id_card,
          'id_image': data.id_image,
          'license_image': data.license_image,
          'contract_image': data.contract_image,
          'contract_name': data.contract_name,
          'contract_mobile': data.contract_mobile, 
          'account_type': '1', 
          'bank_of_deposit': data.bank_of_deposit,
          'bank_of_name': data.bank_of_name,
          'bank_of_account': data.bank_of_account,
        })
      }
    });
  }

  // 上传图片
  handleUploadChange = (info, type) => {
    const { uploadLoading1, uploadLoading2, uploadLoading3, id_image_list, license_image_list, contract_image_list } = this.state;
    const formData = new FormData();
    formData.append('file', info.file);
    if (type == 'id_image') {
      this.setState({ uploadLoading1: true });
      uploadImage(formData).then(res => {
        utils.successReturn(res,() => {
          let id_image_arr = (id_image_list || []);
          id_image_arr.push(res.data.items.path);
          this.setState({
            uploadLoading1: false,
            id_image_list: [...id_image_arr],
          });
        })
      });
    };
    if (type == 'license_image') {
      this.setState({ uploadLoading2: true });
      uploadImage(formData).then(res => {
        if (!utils.successReturn(res)) return;
        let license_image_arr = (license_image_list || []);
        license_image_arr.push(res.data.items.path);
        this.setState({
          uploadLoading2: false,
          license_image_list: [...license_image_arr],
        });
      });
    }
    if (type == 'contract_image') {
      this.setState({ uploadLoading3: true });
      uploadImage(formData).then(res => {
        if (!utils.successReturn(res)) return;
        let contract_image_arr = (contract_image_list || []);
        contract_image_arr.push(res.data.items.path);
        this.setState({
          uploadLoading3: false,
          contract_image_list: [...contract_image_arr],
        });
      });
    }
  };

  handleDelete = index => {
    // let arr;
    // arr = this.state.id_image_list;
    // arr.splice(index, 1);
    // this.setState({
    //   id_image_list: [...arr],
    // });
    this.setState(prevState => ({
      id_image_list: prevState.id_image_list.filter((item,i) => i !== index),
    }),()=>{
        console.log(this.state.id_image_list);
      
    });
  };
  handleDeleteLicenseImage = index => {
    // let arr;
    // arr = this.state.license_image_list;
    // arr.splice(index, 1);
    // this.setState({
    //   license_image_list: [...arr],
    // });
    this.setState(prevState => ({
      license_image_list: prevState.license_image_list.filter((item, i) => i  !== index),
    }));
  };
  handleDeleteContractImage = index => {
    // let arr;
    // arr = this.state.contract_image_list;
    // arr.splice(index, 1);
    // this.setState({
    //   contract_image_list: [...arr],
    // });

    this.setState(prevState => ({
      contract_image_list: prevState.contract_image_list.filter((item, i) => i !== index),
    }));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue);
      const { id_image_list, license_image_list, contract_image_list } = this.state;

      if (id_image_list.length == 0) return message.error('请上传身份证照片');
      if (license_image_list.length == 0) return message.error('请上传营业执照照片');
      if (contract_image_list.length == 0) return message.error('请上传合同照片');
      if (!err) {
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
      }
    });
  }

  postForm = fieldsValue => {
    const { dispatch } = this.props;
    const { merchant_id, id_image_list, license_image_list, contract_image_list } = this.state;
    let formData = new FormData();
    Object.keys(fieldsValue).forEach(key => {
      formData.append(key, fieldsValue[key] || '');
    });
    formData.delete('id_image');
    formData.delete('license_image');
    formData.delete('contract_image');
    formData.append('merchant_id', merchant_id);
    //身份证
    id_image_list.forEach(item => {
      formData.append('id_image[]', item);
    });
    //营业执照
    license_image_list.forEach(item => {
      formData.append('license_image[]', item);
    });
    //合同
    contract_image_list.forEach(item => {
      formData.append('contract_image[]', item);
    });

    this.setState({ submitLoading: true });
    dispatch({
      type: 'merchant/saveMerchantAuth',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        message.success('保存成功', 0.5, () => {
          location.reload();
        });
      },
    });
  }

  render() {
    const { common: { commonConfig: { image_domain } }, form, merchant: { authInfo} } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { verify_status, uploadLoading1, uploadLoading2, uploadLoading3, id_image_list, license_image_list, contract_image_list} = this.state;

    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 6 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 6, offset: 3 },
    };

    const uploadButton = (loading) => (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Card bordered={false}>
        {
          verify_status == 3 && (
            <div className="verify_status_box">
              <div className="verify_status_title">审核不通过原因</div>
              <div className="verify_status_cont">
                <p>{authInfo && authInfo.verify_fail_message}</p>
              </div>
            </div>
          )
        }
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="法人姓名">
            {getFieldDecorator('id_name', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <FormItem {...formLayout} label="身份证号码">
            {getFieldDecorator('id_card', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <FormItem {...formLayout} label="身份证照片">
            {getFieldDecorator('id_image', {
              rules: [{ required: true, message: '必填' }],
            })(
              <div>
                <div>(最大可上传4张，仅支持JPG、PNG格式图片，限制1M以内。)</div>
                <span>
                  <ul className="picture_card_list">
                    {
                      (id_image_list || []).length > 0 ? (
                        id_image_list.map((item, i) => (
                          <li key={i}>
                            <Zmage
                              src={image_domain + item}
                              style={{ width: '81px', height: '81px', }}
                            />
                            {verify_status != 1 && (<span className="del_pic" onClick={() => this.handleDelete(i)}>X</span>)}
                          </li>
                        ))
                      ): null
                    }
                  </ul>
                </span>
                {
                  verify_status != 1 && (
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => {return false;}}
                      onChange={info => {
                        this.handleUploadChange(info, "id_image");
                      }}
                      accept="image/png, image/jpeg"
                    >
                      {(id_image_list || []).length >= 4 ? null : uploadButton(uploadLoading1)}
                    </Upload>
                  )
                }
              </div>
            )}
          </FormItem>
          <FormItem {...formLayout} label="营业执照">
            {getFieldDecorator('license_image', {
              rules: [{ required: true, message: '必填' }],
            })(
              <div>
                <div>(最大可上传4张，仅支持JPG、PNG格式图片，限制1M以内。)</div>
                <span>
                  <ul className="picture_card_list">
                    {
                      (license_image_list || []).length > 0 ? (
                        license_image_list.map((item, i) => (
                          <li key={i}>
                            <Zmage
                              src={image_domain + item}
                              style={{ width: '81px', height: '81px', }}
                            />
                            {verify_status != 1 && (<span className="del_pic" onClick={() => this.handleDeleteLicenseImage(i)}>X</span>)}
                          </li>
                        ))
                      ) : null
                    }
                  </ul>
                </span>
                {
                  verify_status != 1 && (
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => {return false;}}
                      onChange={info => {
                        this.handleUploadChange(info, "license_image");
                      }}
                      accept="image/png, image/jpeg"
                    >
                      {(license_image_list || []).length >= 4 ? null : uploadButton(uploadLoading2)}
                    </Upload>
                  )
                }
              </div>
            )}
          </FormItem>
          <FormItem {...formLayout} label="合同">
            {getFieldDecorator('contract_image', {
              rules: [{ required: true, message: '必填' }],
            })(
              <div>
                <div>(最大可上传4张，仅支持JPG、PNG格式图片，限制1M以内。)</div>
                <span>
                  <ul className="picture_card_list">
                    {
                      (contract_image_list || []).length > 0 ? (
                        contract_image_list.map((item, i) => (
                          <li key={i}>
                            <Zmage
                              src={image_domain + item}
                              style={{ width: '81px', height: '81px', }}
                            />
                            {verify_status != 1 && (<span className="del_pic" onClick={() => this.handleDeleteContractImage(i)}>X</span>)}
                          </li>
                        ))
                      ) : null
                    }
                  </ul>
                </span>
                {
                  verify_status != 1 && (
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => {return false;}}
                      onChange={info => {
                        this.handleUploadChange(info, "contract_image");
                      }}
                      accept="image/png, image/jpeg"
                    >
                      {(contract_image_list || []).length >= 4 ? null : uploadButton(uploadLoading3)}
                    </Upload>
                  )
                }
              </div>
            )}
          </FormItem>
          <FormItem {...formLayout} label="合同签约人">
            {getFieldDecorator('contract_name', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <FormItem {...formLayout} label="签约人手机号">
            {getFieldDecorator('contract_mobile', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <h3 className="title_hd m-t-30">结算信息</h3>
          <FormItem {...formLayout} label="账户类型">
            {getFieldDecorator('account_type', {
              rules: [{ required: true, message: '必填' }],
              initialValue: 1,
            })(
              <Select placeholder="请选择" style={{ width: '100%' }} disabled={verify_status == 1 ? true : false}>
                <Option value="1">储蓄卡</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="开户行">
            {getFieldDecorator('bank_of_deposit', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <FormItem {...formLayout} label="开户名">
            {getFieldDecorator('bank_of_name', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <FormItem {...formLayout} label="账号">
            {getFieldDecorator('bank_of_account', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" autoComplete="off" disabled={verify_status == 1 ? true : false} />)}
          </FormItem>
          <FormItem {...formLayoutWithOutLabel} style={{ marginTop: 32 }}>
            {
              verify_status != 1 && (
                <div>
                  <Button type="primary" htmlType="submit" loading={this.state.submitLoading}>保存</Button>
                  <Button style={{ marginLeft: 8 }} onClick={() => { location.reload() }}>取消</Button>
                </div>
              )
            }
          </FormItem>
        </Form>
      </Card>
    )
  }
}

export default AuthInfo;