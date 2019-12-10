import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { ChromePicker } from 'react-color';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, Tag, message } from 'antd';
import utils, { getBase64, beforeUpload } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
import ColorSelect from "@/components/ColorSelect";
import { uploadImage } from '@/services/common'; // 上传图片
import ShowImg from '@/components/showImg';
import styles from '../Config.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
const titleType = ['新增', '编辑'];
@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
@Form.create()
class ActivityEdit extends PureComponent {
  state = {
    merchantInfo: [],
    merchant_id: '',
    hasMerchantInfo: false,
    selectStoreModalVisible: false,
    formValues: {},
    uploadLoading: false,
    imageUrl: '',
    // background_color: {
    //   r: '24',
    //   g: '144',
    //   b: '255',
    //   a: '1',
    // },
    background_color: '#1890FF',
    background_colorVal: '',
    editType: null,//0为新增，1为编辑
    id: '',
  };


  componentDidMount () {
    const { dispatch, history } = this.props;

    const query = history.location.query
    this.setState({
      editType: query.editType,
    }, () => {
      // console.log('跳转的传参', this.state.editType, this.state.id);
    })
    if (query.id) {
      this.setState({
        id: query.id
      }, () => {
        this.getInfo(query.id);
      });
    }

  }


  getInfo = (id) => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'activity/fetchSubjectInfo',
      payload: {
        id: id,
      },
      callback: res => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        console.log('详情数据', data);
        // 编辑数据赋值
        form.setFieldsValue({
          'name_cn': data.name_cn,
          'name_en': data.name_en,
          'name_kh': data.name_kh,
        }, () => {
          this.setState({
            background_colorVal: data.background_color,
            imageUrl: data.image,
            merchantInfo: data.merchant_data,
            merchant_id: data.merchant_id
          }, () => {
            // console.log('编辑数据赋值', this.state.background_color, this.state.imageUrl, this.state.merchant_id);
          });
        });
      },
    });
  }

  saveForm = () => {
    const { form } = this.props;
    const { editType, id, merchant_id } = this.state
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log('fieldsValue', fieldsValue);
      let delFieldsValue = (({ background_color, image, merchant_id, name_cn, name_en, name_kh }) => ({ background_color, image, merchant_id, name_cn, name_en, name_kh }))(fieldsValue);
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in delFieldsValue) {
        if (delFieldsValue.hasOwnProperty(key)) {
          const val = delFieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }
      // console.log(values);
      // console.log('状态', editType);
      if (editType == 1) {
        // console.log('编辑', newFieldsValue);
        const editValues = {
          id: id,
          status: 2,
          merchant_id: merchant_id,
          ...newFieldsValue,
        };
        // this.setState({
        //   formValues: values,
        // });
        console.log('编辑', editValues);
        this.activityPostVal('activity/fetchEditSubject', editValues);
      } else {
        const addValues = {
          status: 2,
          ...newFieldsValue,
        };
        console.log('新增', addValues);
        this.activityPostVal('activity/fetchAddSubject', addValues);
      }


    });
  }

  saveFormOnline = () => {
    const { form } = this.props;
    const { editType, id, merchant_id } = this.state
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log('fieldsValue', fieldsValue);
      let delFieldsValue = (({ background_color, image, merchant_id, name_cn, name_en, name_kh }) => ({ background_color, image, merchant_id, name_cn, name_en, name_kh }))(fieldsValue);
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in delFieldsValue) {
        if (delFieldsValue.hasOwnProperty(key)) {
          const val = delFieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }
      // console.log(values);
      // console.log('状态', editType);
      if (editType == 1) {
        // console.log('编辑', newFieldsValue);
        const editValues = {
          id: id,
          status: 1,
          merchant_id: merchant_id,
          ...newFieldsValue,
        };
        // this.setState({
        //   formValues: values,
        // });
        console.log('编辑', editValues);
        this.activityPostVal('activity/fetchEditSubject', editValues);
      } else {
        const addValues = {
          status: 1,
          ...newFieldsValue,
        };
        console.log('新增', addValues);
        this.activityPostVal('activity/fetchAddSubject', addValues);
      }


    });
  }



  activityPostVal = (types, fields) => {
    // console.log('提交参数', fields);
    const { dispatch } = this.props;
    const { editType } = this.state;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: types,
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        if (editType) {
          message.success('添加成功');
          router.goBack();
        } else {
          message.success('编辑成功');
          router.goBack();
        }
      },
    });
  };



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
              console.log('上传图片路径', this.state.imageUrl);
              setFieldsValue({
                'image': this.state.imageUrl,
              });
            }
          );
        }
      });
    } else {
      this.setState({ uploadLoading: false });
    }
  };


  selectColor = color => {
    const { form } = this.props
    console.log(color);
    this.setState({
      background_color: color,
    })
    form.setFieldsValue({
      'background_color': color,
    })

  }

  handleSelectStoreModalVisible = (flag, record) => {
    console.log('record', record)
    this.setState({
      selectStoreModalVisible: !!flag,
      merchantInfo: record || {},
    });
  };



  handleSelectStore = (flag, record) => {
    console.log('record', flag, record)
    const { form: { setFieldsValue, getFieldValue } } = this.props


    this.setState({
      selectStoreModalVisible: !!flag,
      merchantInfo: record,
      hasMerchantInfo: true
    }, () => {
      console.log('record state', this.state.merchantInfo)
      const { hasMerchantInfo, merchantInfo } = this.state
      if (hasMerchantInfo) {
        const arr = []
        for (let i = 0; i < merchantInfo.length; i++) {
          const element = merchantInfo[i].merchant_id;
          arr.push(element)
        }
        let merchantId = arr.join(',');
        console.log('merchantId', merchantId);
        setFieldsValue({
          'merchant': merchantInfo,
          'merchant_id': arr.join(',')
        }, () => {
          getFieldValue('merchant_id')
        })
      }
    })




  }

  render () {
    const { imageUrl, background_color, formValues, selectStoreModalVisible, merchantInfo, hasMerchantInfo, editType, background_colorVal, merchant_id } = this.state;
    const {
      list: { list },
      form,
      loading
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
      <Fragment>
        <h3 className={styles.editTitle}><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> <p style={{ paddingTop: 24 }}>{titleType[editType]}专题</p> </h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="专题名称">
            {getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文专题名称">
            {getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文专题名称">
            {getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="图片">
            {getFieldDecorator('image', {
              rules: [{ required: true, message: '请上传图片' }],
              initialValue: imageUrl
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
                {imageUrl || formValues.image ? (
                  <ShowImg src={imageUrl || formValues.image} className="avatar-80" />
                ) : (
                    uploadButton
                  )}
              </Upload>
            )}
          </FormItem>
          <FormItem {...formLayout} label="背景颜色">
            {getFieldDecorator('background_color')(
              <ColorSelect color={editType ? background_colorVal : background_color} selectColor={this.selectColor} />
            )}
          </FormItem>
          <FormItem {...formLayout} label="选择商家">
            {getFieldDecorator('merchant', {
              rules: hasMerchantInfo || merchantInfo.length > 0 ? null : [{ required: true, message: '必选' }],
            })(<div>
              {hasMerchantInfo || merchantInfo.length > 0 ? (<Button icon="form" onClick={() => this.handleSelectStoreModalVisible(true, merchantInfo)}>重新选择</Button>) : (<Button icon="plus" onClick={() => this.handleSelectStoreModalVisible(true, merchant_id)} >
                选择商家</Button>)}
            </div>)}
            {
              selectStoreModalVisible && (<SelectStoreForm
                selectStoreModalVisible={selectStoreModalVisible}
                handleSelectStoreModalVisible={this.handleSelectStoreModalVisible}
                handleSelectStore={this.handleSelectStore}
                values={merchantInfo}
                hasMerchantInfo={hasMerchantInfo}
                merchant_id={merchant_id}
              />)
            }

          </FormItem>
          {hasMerchantInfo || merchantInfo.length > 0 ? (<FormItem {...formLayout} label="已选商家">
            {getFieldDecorator('merchant_id', {
              rules: hasMerchantInfo || merchantInfo.length > 0 ? null : [{ required: true, message: '必选' }],
            })(
              <div>
                {
                  merchantInfo.map((item, i) => {
                    return (<Tag color="#1890ff" key={i} style={{ marginRight: 5 }} >{item.name}</Tag>)
                  })
                }
              </div>
            )}
          </FormItem>) : null}
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" onClick={this.saveForm} >
              <FormattedMessage id="form.save" />
            </Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={this.saveFormOnline}>
              <FormattedMessage id="form.saveSubmit" />
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
              <FormattedMessage id="form.cancel" />
            </Button>
          </FormItem>
        </Form>
      </Fragment >
    );
  }
}

export default ActivityEdit;