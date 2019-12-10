import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, Tag, message } from 'antd';
import utils, { getBase64, beforeUpload } from '@/utils/utils';
import ShowImg from '@/components/showImg';
import SelectStoreForm from '@/components/SelectStoreForm'
import SelectMerchantDish from '@/components/SelectMerchantDish'
import SelectAdsBusiness from '@/components/SelectAdsBusiness'
import { uploadImage, getDriver } from '@/services/common'; // 上传图片
import ColorSelect from "@/components/ColorSelect";
import styles from '../Config.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
const { RangePicker } = DatePicker;
const title = ['', '启动页', '首页弹窗', '首页顶部', '推荐专区', '订单详情页'];
const titleType = ['新增', '编辑'];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 10, offset: 3 },
  },
};
@connect(({ common, list, loading }) => ({
  common,
  list,
  loading: loading.models.list,
}))
@Form.create()
class AdsForm extends PureComponent {
  state = {
    position: '',
    editType: null,//0为新增，1为编辑
    id: '',
    formValues: {},
    uploadLoading: false,
    urlTypeView: 1,
    showTypeView: 1,
    selectStoreModalVisible: false,
    selectMerchantDishModalVisible: false,
    selectAdsBusinessModalVisible: false,
    logoUrl: '',
    bg_color: '#1890FF',
    button_color: '#1890FF',
    merchantInfo: [],//选择商家
    adsBusiness: [],//选择商圈
    merchant_id: '',
    hasMerchantInfo: false,
    hasAdsBusiness: false,
  };

  componentDidMount () {
    const { dispatch, history } = this.props;
    const query = history.location.query
    this.setState({
      position: query.type,
      editType: query.editType,
      id: query.id
    }, () => {
      console.log('位置 1-启动页(默认) 2-首页弹窗 3-首页顶部 4-推荐专区 5-订单详情页>>>', this.state.position, this.state.editType, this.state.id);
    })

    // // 编辑页面
    // if (match.params.id) {
    //   this.setState({
    //     title: '编辑',
    //     id: match.params.id,
    //   }, () => {
    //       this.getInfo();
    //   });
    // }
  }




  saveForm = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      if (fieldsValue.show_time) {
        const rangeValue = fieldsValue.show_time;
        fieldsValue.show_start_time = moment(rangeValue[0]).unix();
        fieldsValue.show_end_time = moment(rangeValue[1]).unix();
        delete fieldsValue.show_time;
      }
      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });

      console.log(values);
      // this.getUserList(values);
    });
  }



  selectColor = color => {
    console.log(color);
    this.setState({
      bg_color: color,
      button_color: color,
    })
  }

  onChangeUrlType = e => {
    console.log('UrlType event:', e);
    this.setState({
      urlTypeView: e,
    })
    return e;
  };

  onChangeShowType = e => {
    console.log('showTypeView event:', e);
    this.setState({
      showTypeView: e.target.value,
    })
    return e.target.value;
  };

  // onChangePositionType = e => {
  //   console.log('posTypeView:', e.target.value);
  //   this.setState({
  //     posTypeView: e.target.value,
  //   })
  //   return e.target.value;
  // };


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


  handleSelectAdsBusiness = (flag, record) => {
    console.log('record', flag, record)
    const { form: { setFieldsValue, getFieldValue } } = this.props
    this.setState({
      selectAdsBusinessModalVisible: !!flag,
      adsBusiness: record,
      hasAdsBusiness: true
    }, () => {
      console.log('record state', this.state.adsBusiness)
      const { hasAdsBusiness, adsBusiness } = this.state
      if (hasAdsBusiness) {
        const arr = []
        for (let i = 0; i < adsBusiness.length; i++) {
          const element = adsBusiness[i].id;
          arr.push(element)
        }
        // let merchantId = arr.join(',');
        // console.log('merchantId', merchantId);
        setFieldsValue({
          'business': adsBusiness,
          'business_id': arr.join(',')
        }, () => {
          getFieldValue('business_id')
        })
      }
    })
  }



  handleSelectStoreModalVisible = (flag, record) => {
    console.log('record', record)
    this.setState({
      selectStoreModalVisible: !!flag,
      merchantInfo: record || {},
    });
  };

  handleSelectMerchantDishModalVisible = (flag, record) => {
    console.log('record', record)
    this.setState({
      selectMerchantDishModalVisible: !!flag,
      formValues: record || {},
    });
  };

  handleSelectAdsBusinessModalVisible = (flag, record) => {
    // console.log('record', record)
    this.setState({
      selectAdsBusinessModalVisible: !!flag,
      adsBusiness: record || {},
    });
  };

  // handleUploadChange = info => {
  //   if (info.file.status === 'uploading') {
  //     this.setState({ uploadLoading: true });
  //     return;
  //   }
  //   if (info.file.status === 'done') {
  //     // Get this url from response in real world.
  //     getBase64(info.file.originFileObj, imageUrl =>
  //       this.setState({
  //         imageUrl,
  //         uploadLoading: false,
  //       }),
  //     );
  //   }
  // };

  handleUploadChange = info => {
    const {
      common: { commonConfig },
      form,
    } = this.props;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    if (beforeUpload(info.file)) {
      uploadImage(formData).then(res => {
        if (res && res.code == 200) {
          this.setState(
            {
              // logoUrl: commonConfig.image_domain + res.data.items.path,
              logoUrl: res.data.items.path,
              uploadLoading: false,
            },
            () => {
              form.setFieldsValue({
                logo: this.state.logoUrl,
              });
            }
          );
          console.log(this.state.logoUrl);
        }
      });
    } else {
      this.setState({ uploadLoading: false });
    }


  };



  render () {
    const { editType, position, logoUrl, urlTypeView, showTypeView, formValues, selectStoreModalVisible, selectMerchantDishModalVisible, selectAdsBusinessModalVisible, bg_color, button_color, merchantInfo, hasMerchantInfo, adsBusiness, hasAdsBusiness } = this.state;
    const {
      form,
      form: { getFieldDecorator },
    } = this.props;
    // console.log('common', common);



    const uploadButton = (
      <div>
        <Icon type={this.state.uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Fragment>
        <h3 className={styles.editTitle}><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> <p style={{ paddingTop: 24 }}>{titleType[editType]}{title[position]}广告</p> </h3>

        {/* <SelectMerchantDish
          selectMerchantDishModalVisible={true}
          handleSelectMerchantDishModalVisible={this.handleSelectMerchantDishModalVisible}
          handleSelectMerchantDish={this.handleSelectMerchantDish}
          values={formValues}
        /> */}
        <Form onSubmit={this.handleSubmit}>
          {position == 2 && (<FormItem {...formItemLayout} label="投放形式">
            {getFieldDecorator('show_type', {
              initialValue: '1',
              getValueFromEvent: this.onChangeShowType,
              rules: [
                {
                  required: true,
                  message: '请选择投放形式'
                },
              ],
            })(
              <Radio.Group>
                <Radio value="1">优惠券</Radio>
                <Radio value="2">营销活动</Radio>
                <Radio value="3">营销活动+优惠券</Radio>
              </Radio.Group>
            )}
          </FormItem>)}
          {/* (position=1 | 3 | 4 | 5；position=2 & show_type=2 时必填) */}
          {position == 1 || position == 3 || position == 4 || position == 5 || position == 2 && showTypeView == 2 ? (<FormItem {...formItemLayout} label="跳转类型">
            {getFieldDecorator('urlType', {
              initialValue: '1',
              getValueFromEvent: this.onChangeUrlType,
              rules: position == 1 || position == 3 || position == 4 || position == 5 ? ([{ required: true, message: '请选择跳转类型' }]) : null,
            })(
              <Select>
                <Option value="1">外链</Option>
                <Option value="2">商家详情</Option>
                <Option value="3">菜品详情</Option>
                <Option value="4">专题页</Option>
              </Select>
            )}
          </FormItem>) : null}

          {
            (urlTypeView == 1 || urlTypeView == 4) && (
              <FormItem {...formItemLayout} label="链接地址">
                {getFieldDecorator('url')(<Input placeholder="请输入" />)}
              </FormItem>
            )
          }
          {/* 商家ID(多个用英文逗号隔开) (position!=2 & type=2(只能选1个)；position=2 & show_type=1(可选5个), position=2 & show_type=2 & type=2(只能选1个), position=2 & show_type=3(可选5个) */}
          {
            (urlTypeView == 2 || urlTypeView == 3) && (<div>
              <FormItem {...formItemLayout} label="选择商家">
                {getFieldDecorator('merchant', {
                  rules: hasMerchantInfo || merchantInfo.length > 0 ? null : [{ required: true, message: '必选' }],
                })(<div>
                  {hasMerchantInfo || merchantInfo.length > 0 ? (<Button icon="form" onClick={() => this.handleSelectStoreModalVisible(true, merchantInfo)}>重新选择</Button>) : (<Button icon="plus" onClick={() => this.handleSelectStoreModalVisible(true, merchantInfo)} >
                    选择商家</Button>)}
                </div>)}
                {selectStoreModalVisible && (<SelectStoreForm
                  selectStoreModalVisible={selectStoreModalVisible}
                  handleSelectStoreModalVisible={this.handleSelectStoreModalVisible}
                  handleSelectStore={this.handleSelectStore}
                  values={merchantInfo}
                  hasMerchantInfo={hasMerchantInfo}
                  selectableNum={5}
                />)}
              </FormItem>
              {hasMerchantInfo || merchantInfo.length > 0 ? (<FormItem {...formItemLayout} label="已选商家">
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
            </div>
            )
          }
          {/* 商家的菜品ID (position!=2 & type=3; position=2 & show_type=2 & type=3 只能选1个) */}
          {/* {
            (posTypeView != 2 && urlTypeView == 3  ||  (posTypeView != 2 && urlTypeView == 3) 
          } */}
          <FormItem {...formItemLayout} label="菜品">
            {getFieldDecorator('url')(
              <InputGroup>
                <Input style={{ width: '80%' }} placeholder="请输入" />
                <Button style={{ width: '20%' }} onClick={() => this.handleSelectMerchantDishModalVisible(true, formValues)}>选择菜品</Button>
              </InputGroup>
            )}
            {selectMerchantDishModalVisible && (<SelectMerchantDish
              selectMerchantDishModalVisible={selectMerchantDishModalVisible}
              handleSelectMerchantDishModalVisible={this.handleSelectMerchantDishModalVisible}
              handleSelectMerchantDish={this.handleSelectMerchantDish}
              values={formValues}
            />)}
          </FormItem>
          <FormItem {...formItemLayout} label="广告主题">
            {getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formItemLayout} label="英文广告主题">
            {getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="柬文广告主题">
            {getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="图片" extra="支持.png .jpg 格式,大小限制300K以内">
            {getFieldDecorator('image', {
              rules: position == 1 || position == 2 || position == 5 ? ([{ required: true, message: '请上传图片' }]) : null,
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
                {logoUrl || this.state.formValues.logo ? (
                  <ShowImg src={logoUrl || formValues.logo} className="avatar-80" />
                ) : (
                    uploadButton
                  )}
              </Upload>
            )}
          </FormItem>
          {/* 首页弹窗广告 */}
          <FormItem {...formItemLayout} label="背景色值">
            {getFieldDecorator('bg_color', {
              rules: [{ required: true, message: '请选择' }],
            })(<ColorSelect color={bg_color} selectColor={this.selectColor} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="按钮色值">
            {getFieldDecorator('button_color', {
              rules: [{ required: true, message: '请选择' }],
            })(<ColorSelect color={button_color} selectColor={this.selectColor} />)}
          </FormItem>
          {/* end首页弹窗广告 */}
          <FormItem {...formItemLayout} label="投放时段">
            {getFieldDecorator('show_time', {
              rules: [{ required: true, message: '请选择' }],
            })(<RangePicker />)}
          </FormItem>
          <FormItem {...formItemLayout} label="投放区域">
            {getFieldDecorator('business', {
              rules: hasAdsBusiness || adsBusiness.length > 0 ? null : [{ required: true, message: '必选' }],
            })(<div>
              {hasAdsBusiness || adsBusiness.length > 0 ? (<Button icon="form" onClick={() => this.handleSelectAdsBusinessModalVisible(true, adsBusiness)}>重新选择</Button>) : (<Button icon="plus" onClick={() => this.handleSelectAdsBusinessModalVisible(true, adsBusiness)} >
                选择投放区域</Button>)}
            </div>)}
            {selectAdsBusinessModalVisible && (<SelectAdsBusiness
              selectAdsBusinessModalVisible={selectAdsBusinessModalVisible}
              handleSelectAdsBusinessModalVisible={this.handleSelectAdsBusinessModalVisible}
              handleSelectAdsBusiness={this.handleSelectAdsBusiness}
              values={adsBusiness}
            />)}
          </FormItem>
          {hasAdsBusiness || adsBusiness.length > 0 ? (<FormItem {...formItemLayout} label="已选投放区域">
            {getFieldDecorator('business_id', {
              rules: hasMerchantInfo || adsBusiness.length > 0 ? null : [{ required: true, message: '必选' }],
            })(
              <div>
                {
                  adsBusiness.map((item, i) => {
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
            <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">
              <FormattedMessage id="form.saveSubmit" />
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
              <FormattedMessage id="form.cancel" />
            </Button>
          </FormItem>
        </Form>

      </Fragment>
    );
  }
}

export default AdsForm;