import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Card,
  Form,
  Input,
  Button,
  Divider,
  Modal,
  Radio,
  message,
  Row,
  Col,
  Icon,
  Select,
  Upload,
} from 'antd';
import { getBase64, beforeUpload, goBack } from '@/utils/utils';
import {
  uploadImage,
  getMCategory,
  getBdManagerBusiness,
  getTranslate,
} from '@/services/common';
import PrefixSelector from '@/components/PrefixSelector/index';
import utils from '@/utils/utils';
import ShowImg from '@/components/showImg';
import GoogleGeocoding from '@/components/GoogleGeocoding/index';

const FormItem = Form.Item;
const { Option } = Select;
let key_num = 1;
let order_mobile_key = 1;
let category_arr = [''];

@connect(({ common, merchant, loading }) => ({
  common,
  merchant,
  loading: loading.models.merchant,
}))
@Form.create()
class MerchantInfo extends Component {
  state = {
    merchant_id: '',
    submitLoading: false,
    modalCategory: false,
    uploadLoading: false,
    uploadLoading2: false,
    logoUrl: '',
    imageUrl: '',
    level_1_id: undefined,
    level_2_id: undefined,
    level_3_id: undefined,
    MCategorylevel_2: [],
    MCategorylevel_3: [],
    edit_category_key: '',
    gps: [104.91667, 11.55],
    showMap: false,
    center: {},
    mobile: '',
    mobile_prefix: '',
    verify_success: 1,
    verify_status: 0,
    verify_fail_message: '',
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const { params } = this.props;
    this.setState({
      merchant_id: params.id,
    }, () => {
      // 获取认证状态信息
      this.getBasicInfo();
    });
  }

  componentWillUnmount() {
    key_num = 1;
    order_mobile_key = 1;
    category_arr = [''];
  }

  getBasicInfo = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'merchant/fetchBasicInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        //渲染数据
        // console.log(data);

        // 处理商家分类数据
        let category_key = [];
        let category_data_arr = [];
        let category_data = data.category;
        if (category_data.length > 0) {
          key_num = category_data.length;
          category_data.forEach((el, i) => {
            category_key.push(i);
          });
          form.setFieldsValue({
            keys: category_key,
          }, () => {
            category_data.forEach((el, i) => {
              category_data_arr.push({
                value: {
                  id: el.id,
                  category_one_id: el.category_one_id,
                  category_two_id: el.category_two_id,
                  category_three_id: el.category_three_id,
                },
                name: el.category_one_name + '-' + el.category_two_name + '-' + el.category_three_name,
              });
            });
            category_arr = category_data_arr;
          });
        }

        // 处理订餐电话
        let order_mobile_num = [];
        let order_mobile_data = data.m_user_info.order_mobile;
        if (order_mobile_data.length > 0) {
          order_mobile_data.forEach((el, i) => {
            order_mobile_num.push(i);
          });
          order_mobile_key = order_mobile_num.length;
          form.setFieldsValue({
            order_keys: order_mobile_num,
          }, () => {
            order_mobile_data.forEach((el, i) => {
              form.setFieldsValue({
                ['order_mobile[' + i + ']']: el,
              });
            });
          });
        }

        // form表单数据
        form.setFieldsValue({
          logo: data.m_user_info.logo,
          background_image: data.m_user_info.background_image,
          name_cn: data.m_user_info.name_cn,
          name_en: data.m_user_info.name_en,
          name_kh: data.m_user_info.name_kh,
          country_id: data.m_user_info.country_id,
          city_id: data.m_user_info.city_id,
          region_id: data.m_user_info.region_id,
          business_id: data.m_user_info.business_id != 0 ? data.m_user_info.business_id : undefined,
          address_cn: data.m_user_info.address_cn,
          address_en: data.m_user_info.address_en,
          address_kh: data.m_user_info.address_kh,
          contact_name: data.m_user_info.contact_name,
          store_mobile: data.m_user_info.store_mobile,
          desc_cn: data.m_user_info.desc_cn,
          desc_en: data.m_user_info.desc_en,
          desc_kh: data.m_user_info.desc_kh,
        }, () => {
          this.setState({
            verify_success: data.verify_success,
            verify_status: data.verify_status,
            verify_fail_message: data.verify_fail_message,
            mobile: data.mobile,
            mobile_prefix: data.mobile_prefix,
            logoUrl: data.m_user_info.logo,
            imageUrl: data.m_user_info.background_image,
            gps: [...data.m_user_info.gps.split(",")],
          }, () => {
            // 获取商家分类分级数据
            this.getLevelMCategory();
            //获取国家区域数据
            this.getCommon();
            this.setState({
              showMap: true,
              center: {
                lng: this.state.gps[0],
                lat: this.state.gps[1]
              }
            });
          });
        });
      }
    });
  }

  getLevelMCategory = () => {
    const { dispatch } = this.props;
    // 选择分类
    dispatch({
      type: 'common/getMCategory',
      payload: null,
    });
  };

  getCommon = () => {
    const { dispatch, form } = this.props;
    //获取全部的国家
    dispatch({
      type: 'common/getCountry',
      payload: {},
    });
    dispatch({
      type: 'common/getCity',
      payload: {
        country_id: form.getFieldValue('country_id'),
      },
    });
    dispatch({
      type: 'common/getRegion',
      payload: {
        city_id: form.getFieldValue('city_id'),
      },
    });
    dispatch({
      type: 'common/getBusiness',
      payload: {
        region_id: form.getFieldValue('region_id'),
      },
    });
  };

  // 国家联级使用
  selectCountry = id => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      city_id: undefined,
    });
    this.selectCity();
    dispatch({
      type: 'common/getCity',
      payload: id ? { country_id: id } : 'clear',
    });
  };
  selectCity = id => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      region_id: undefined,
    });
    this.selectRegions();
    dispatch({
      type: 'common/getRegion',
      payload: id ? { city_id: id } : 'clear',
    });
  };
  selectRegions = id => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      business_id: undefined,
    });
    dispatch({
      type: 'common/getBusiness',
      payload: id ? { region_id: id,is_all:1 } : 'clear',
    });
  };

  handleUploadChange = (info, type) => {
    const { form } = this.props;
    const formData = new FormData();
    formData.append('file', info.file);

    if (type == 'logo') {
      this.setState({ uploadLoading: true });
      // 上传图片
      uploadImage(formData).then(res => {
        if (res && res.code == 200) {
          this.setState(
            {
              logoUrl: res.data.items.path,
              uploadLoading: false,
            },
            () => {
              form.setFieldsValue({
                logo: res.data.items.path,
              });
            }
          );
        }
      });
    } else if (type == 'background_image') {
      this.setState({ uploadLoading2: true });
      // 上传图片
      uploadImage(formData).then(res => {
        if (res && res.code == 200) {
          this.setState(
            {
              imageUrl: res.data.items.path,
              uploadLoading2: false,
            },
            () => {
              form.setFieldsValue({
                background_image: res.data.items.path,
              });
            }
          );
        }
      });
    }
  };

  // 商家分类级联
  selectLevelMCategory = (flag, key, val) => {
    this.setState({
      modalCategory: !!flag,
      edit_category_key: key,
      level_1_id: undefined,
      level_2_id: undefined,
      level_3_id: undefined,
    });
    if (val) {
      this.setState({
        level_1_id: val.category_one_id,
        level_2_id: val.category_two_id,
        level_3_id: val.category_three_id,
      },()=>{
          this.setLabel1(val.category_one_id);
          this.setLabel2(val.category_two_id);
          this.setLabel3(val.category_three_id);
      });
    }
  };
  setLabel1 = id => {
    this.setState({
      level_1_id: id,
      level_2_id: undefined,
      MCategorylevel_2: [],
      MCategorylevel_3: [],
    });
    const { form } = this.props;
    if (!id) {
      form.setFieldsValue({
        MCategorylevel_2: undefined,
      });
      this.setState({ MCategorylevel_2: [] });
      return;
    }
    getMCategory({
      id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        MCategorylevel_2: res.data.items,
      });
    });
  };
  setLabel2 = id => {
    this.setState({
      level_3_id: undefined,
      MCategorylevel_3: [],
    });
    if (!id) {
      this.setState({
        level_2_id: undefined,
      });
      this.setState({ MCategorylevel_3: [] });
      return;
    }
    getMCategory({
      id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        MCategorylevel_3: res.data.items,
        level_2_id: id,
      });
    });
  };
  setLabel3 = val => {
    this.setState({
      level_3_id: val,
    });
  };
  // 保存分类选择
  saveLevelMCategory = () => {
    const { common, form } = this.props;
    const { getMCategory } = common;
    const { level_1_id, level_2_id, level_3_id, edit_category_key } = this.state;
    let category_one_name = '',
      category_two_name = '',
      category_three_name = '';
    getMCategory.forEach(element => {
      if (element.id == level_1_id) {
        category_one_name = element.name;
      }
    });
    this.state.MCategorylevel_2.forEach(element => {
      if (element.id == level_2_id) {
        category_two_name = element.name;
      }
    });
    this.state.MCategorylevel_3.forEach(element => {
      if (element.id == level_3_id) {
        category_three_name = element.name;
      }
    });
    // 校验
    if (!level_1_id || !level_2_id || !level_3_id) {
      return message.error('请选择分类');
    }
    // 保存编辑or新增
    let data = {
      value: {
        id: '0',
        category_one_id: level_1_id,
        category_two_id: level_2_id,
        category_three_id: level_3_id,
      },
      name: category_one_name + '-' + category_two_name + '-' + category_three_name,
    }
    if (category_arr.hasOwnProperty(edit_category_key)) {
      if (category_arr[edit_category_key].id) {
        category_arr.splice(edit_category_key, 1, {
          value: {
            id: category_arr[edit_category_key].id,
            category_one_id: level_1_id,
            category_two_id: level_2_id,
            category_three_id: level_3_id,
          },
          name: category_one_name + '-' + category_two_name + '-' + category_three_name,
        });
      } else {
        category_arr.splice(edit_category_key, 1, {
          value: {
            id: '0',
            category_one_id: level_1_id,
            category_two_id: level_2_id,
            category_three_id: level_3_id,
          },
          name: category_one_name + '-' + category_two_name + '-' + category_three_name,
        });
      }
    }
    //储存进form
    form.setFieldsValue({
      ["category[" + edit_category_key + "]"]: category_arr[edit_category_key].value,
    })
    this.selectLevelMCategory(false);
  };

  // 获取地图组件方法实例
  onRef = (ref) => {
    this.child = ref;
  }
  searchGeocoding = () => {
    const { form } = this.props;
    let content = '';
    const content_cn = form.getFieldValue('address_cn') || '';
    const content_en = form.getFieldValue('address_en') || '';
    const content_kh = form.getFieldValue('address_kh') || '';
    if (content_cn == '' && content_en == '' && content_kh == '') {
      return message.error('请输入内容！');
    } else if (content_cn != '') {
      content = content_cn;
    } else if (content_en != '') {
      content = content_en;
    } else if (content_kh != '') {
      content = content_kh;
    };
    this.child.searchGeocoding(content);
  };
  // 返回地址坐标
  onChangeMap = (gps) => {
    // console.log(gps);
    this.setState({
      gps: [...gps],
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      console.log(values);
      if (!err) {
        // 提醒确认
        Modal.confirm({
          title: '保存商家信息',
          content: '保存后，修改的内容直接提交审核，直到审核结束后才可以重新修改信息，是否继续。',
          onOk: () => {
            this.postForm(values);
          },
          onCancel() {
            return;
          },
        });
      }
    });
  };

  postForm = values => {
    const { dispatch } = this.props;
    const { keys, category, order_keys, order_mobile } = values;
    this.setState({ submitLoading: true });

    let formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, values[key] || '');
    });
    // 商家id
    formData.append('merchant_id', this.state.merchant_id); 
    formData.append('mobile', this.state.mobile);
    formData.append('mobile_prefix', this.state.mobile_prefix);
    // 商家分类解构
    let category_data = keys.map(key => category[key]);
    for (let i = 0; i < category_data.length; i++) {
      formData.append(`category[${i}][id]`, category_data[i]['id']);
      formData.append(`category[${i}][category_one_id]`, category_data[i]['category_one_id']);
      formData.append(`category[${i}][category_two_id]`, category_data[i]['category_two_id']);
      formData.append(`category[${i}][category_three_id]`, category_data[i]['category_three_id']);
    }
    // 商家分类解构
    let order_mobile_data = order_keys.map(key => order_mobile[key]);
    for (let n = 0; n < order_mobile_data.length; n++) {
      formData.append('order_mobile[' + n + ']', order_mobile_data[n]);
    }
    formData.append('gps', this.state.gps.join(','));
    // formData.append('gps', '0,0');

    formData.delete('category');
    formData.delete('order_mobile');
    // 提交表单
    dispatch({
      type: 'merchant/fetchEditMerchant',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        message.success('保存成功', 0.5, () => {
          // location.reload();
          // this.getBasicInfo();
          // window.scrollTo(0, 0);
        });
      },
    });
  };

  render() {
    const { form, loading, common } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      uploadLoading,
      uploadLoading2,
      logoUrl,
      imageUrl,
      showBusiness,
      submitLoading,
      MCategorylevel_2,
      MCategorylevel_3,
      verify_success,
      verify_status,
      verify_fail_message,
    } = this.state;
    const { getMCategory = [], country = [], city = [], region = [], business = [], } = common;
    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 6 },
    };
    const formLayout_model = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 },
    };
    const formLayout_more = {
      labelCol: { span: 3 },
      wrapperCol: { span: 8 },
    };
    const formLayout_two = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 6, offset: 3 },
    };

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const uploadButton2 = (
      <div>
        <Icon type={uploadLoading2 ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    // 添加多项分类事件
    const removeCategory = k => {
      const keys = getFieldValue('keys');
      if (keys.length === 0) {
        return;
      }
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
      category_arr.forEach((el, i) => {
        if (i == k) {
          el = '';
        }
      });
    };
    const addCategory = () => {
      const keys = getFieldValue('keys');
      const nextKeys = keys.concat(key_num++);
      form.setFieldsValue({
        keys: nextKeys,
      });
      category_arr.push('');
    };
    getFieldDecorator('keys', { initialValue: [0] });
    const keys = getFieldValue('keys');
    const categoryFormItems = keys.map((k, index) => (
      <FormItem
        {...(index === 0 ? formLayout : formLayoutWithOutLabel)}
        label={index === 0 ? '商家分类' : ''}
        key={k}
      >
        {getFieldDecorator(`category[${k}]`, {
          rules: [{ required: true, message: '必填' }],
          initialValue: (category_arr[k] && category_arr[k].value) || undefined,
        })(
          <span
            className="selectInput"
            onClick={() => {
              this.selectLevelMCategory(true, k, category_arr[k] && category_arr[k].value);
            }}
          >
            {category_arr[k] && category_arr[k].name != '' ? (
              <span className="input-text" title={category_arr[k].name}>{category_arr[k].name}</span>
            ) : (
                <span className="input-placeholder">请选择分类</span>
              )}
            <span className="input-suffix"><Icon type="down" /></span>
          </span>
        )}
        {
          (keys.length > 0 && keys.length != index + 1) && (
            <Icon
              className="dynamic-button"
              type="minus-circle-o"
              title="删除"
              onClick={() => removeCategory(k)}
            />
          )
        }
        {
          keys.length == index + 1 && (
            <span>
              <Icon
                className="dynamic-button"
                type="plus-circle"
                title="新增"
                onClick={addCategory}
              />
              {
                index != 0 && (
                  <Icon
                    className="dynamic-button"
                    type="minus-circle-o"
                    title="删除"
                    onClick={() => removeCategory(k)}
                  />
                )
              }
            </span>
          )
        }
      </FormItem>
    ));

    // 添加多项订餐事件
    const removeOrderMobile = k => {
      const keys = getFieldValue('order_keys');
      if (keys.length === 1) {
        return;
      }
      form.setFieldsValue({
        order_keys: keys.filter(key => key !== k),
      });
    };
    const addOrderMobile = () => {
      const order_keys = getFieldValue('order_keys');
      const nextKeys = order_keys.concat(order_mobile_key++);
      form.setFieldsValue({
        order_keys: nextKeys,
      });
    };
    getFieldDecorator('order_keys', { initialValue: [0] });
    const order_keys = getFieldValue('order_keys');
    const orderMobileList = order_keys.map((k, index) => (
      <FormItem
        {...(index === 0 ? formLayout : formLayoutWithOutLabel)}
        label={index === 0 ? '订餐电话' : ''}
        key={k}
      >
        {getFieldDecorator(`order_mobile[${k}]`, {
          rules: [{ required: true, message: '必填' }],
        })(<Input placeholder="请输入" autoComplete="off" />)}
        {index === 0 ? (
          <Icon className="dynamic-button" type="plus-circle" title="新增" onClick={addOrderMobile} />
        ) : (
            <Icon
              className="dynamic-button"
              type="minus-circle-o"
              title="删除"
              onClick={() => removeOrderMobile(k)}
            />
          )}
      </FormItem>
    ));

    return (
      <Card bordered={false} loading={loading}>
        <div>
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
            <FormItem {...formLayout} label="商家登录手机号">
              <span>{this.state.mobile && ('+' + this.state.mobile_prefix + ' ' + this.state.mobile)}</span>
              {/* {getFieldDecorator('mobile', {
                rules: [{ required: true, message: '必填' }],
              })(<Input addonBefore={<PrefixSelector form={form} value={this.state.mobile_prefix} />} placeholder="请输入" />)} */}
            </FormItem>
            <FormItem {...formLayout} label="店铺头像" required>
              {getFieldDecorator('logo', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Upload
                  name="logo"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {return false;}}
                  onChange={info => {
                    this.handleUploadChange(info, 'logo');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {logoUrl ? <ShowImg src={logoUrl} className="avatar-86" /> : uploadButton}
                </Upload>
              )}
            </FormItem>
            <FormItem {...formLayout} label="店铺招牌" required>
              {getFieldDecorator('background_image', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Upload
                  name="background_image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {return false;}}
                  onChange={info => {
                    this.handleUploadChange(info, 'background_image');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {imageUrl ? <ShowImg src={imageUrl} className="avatar-86" /> : uploadButton2}
                </Upload>
              )}
            </FormItem>
            <FormItem {...formLayout_more} label="商家名称">
              <div className="form-col-box">
                <FormItem {...formLayout_two} label="中文">
                  {getFieldDecorator('name_cn', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" />)}
                  <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                    <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
                  </span>
                </FormItem>
                <FormItem {...formLayout_two} label="英文">
                  {getFieldDecorator('name_en', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" />)}
                </FormItem>
                <FormItem {...formLayout_two} label="柬文">
                  {getFieldDecorator('name_kh', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" />)}
                </FormItem>
              </div>
            </FormItem>
            <FormItem {...formLayout} label="店铺ID">
              <span>{this.state.merchant_id}</span>
            </FormItem>
            {/* 商家分类-start */}
            {categoryFormItems}
            {/* 选择商家分类 */}
            <Modal
              width={640}
              destroyOnClose
              title="选择分类"
              visible={this.state.modalCategory}
              onOk={() => { this.saveLevelMCategory() }}
              onCancel={() => {
                this.selectLevelMCategory(false);
              }}
            >
              <div>
                {getMCategory != null && (
                  <div>
                    <FormItem {...formLayout_model} label="一级分类">
                      <Select
                        placeholder="请选择"
                        style={{ width: '100%' }}
                        value={this.state.level_1_id}
                        onChange={this.setLabel1}
                      >
                        {getMCategory.map((item, i) => (
                          <Option value={item.id} key={i}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                    <FormItem {...formLayout_model} label="二级分类">
                      <Select
                        placeholder="请选择"
                        style={{ width: '100%' }}
                        value={this.state.level_2_id}
                        onChange={this.setLabel2}
                      >
                        {MCategorylevel_2.map((item, i) => (
                          <Option value={item.id} key={i}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                    <FormItem {...formLayout_model} label="三级分类">
                      <Select
                        placeholder="请选择"
                        style={{ width: '100%' }}
                        value={this.state.level_3_id}
                        onChange={this.setLabel3}
                      >
                        {MCategorylevel_3.map((item, i) => (
                          <Option value={item.id} key={i}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                  </div>
                )}
              </div>
            </Modal>
            {/* 商家分类-end */}
            <FormItem {...formLayout} label="国家">
              {form.getFieldDecorator('country_id', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={val => {
                    this.selectCountry(val);
                  }}
                  disabled={verify_success == 2 ? true : false}
                >
                  {country.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formLayout} label="城市">
              {form.getFieldDecorator('city_id', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={val => {
                    this.selectCity(val);
                  }}
                  disabled={verify_success == 2 ? true : false}
                >
                  {city.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formLayout} label="区域">
              {form.getFieldDecorator('region_id', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={val => {
                    this.selectRegions(val);
                  }}
                  disabled={verify_success == 2 ? true : false}
                >
                  {region.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formLayout} label="商圈">
              {form.getFieldDecorator('business_id', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Select placeholder="请选择" style={{ width: '100%' }} disabled={verify_success == 2 ? true : false} allowClear>
                  {business.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formLayout_more} label="详细地址">
              <div className="form-col-box">
                <FormItem {...formLayout_two} label="中文">
                  {getFieldDecorator('address_cn', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" autoComplete="off" disabled={verify_success == 2 ? true : false} />)}
                  <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                    <a onClick={() => { utils.translator(form, 'address') }}>翻译</a>
                  </span>
                </FormItem>
                <FormItem {...formLayout_two} label="英文">
                  {getFieldDecorator('address_en', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" autoComplete="off" disabled={verify_success == 2 ? true : false} />)}
                </FormItem>
                <FormItem {...formLayout_two} label="柬文">
                  {getFieldDecorator('address_kh', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" autoComplete="off" disabled={verify_success == 2 ? true : false} />)}
                </FormItem>
                <div className="dynamic-button" style={{ right: '-80px' }}>
                  <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
                </div>
              </div>
              {
                this.state.showMap && (
                  <GoogleGeocoding
                    onRef={this.onRef}
                    onChange={this.onChangeMap}
                    style={{ height: 430 }}
                    center={this.state.center}
                    markerDraggable={verify_success == 2 ? true : false}
                  />
                )
              }
            </FormItem>
            <FormItem {...formLayout} label="商家联系人">
              {getFieldDecorator('contact_name', {})(
                <Input placeholder="请输入" autoComplete="off" />
              )}
            </FormItem>
            <FormItem {...formLayout} label="联系电话">
              {getFieldDecorator('store_mobile', {})(
                <Input placeholder="请输入" autoComplete="off" />
              )}
            </FormItem>
            {orderMobileList}
            <FormItem {...formLayout_more} label="商家简介">
              <div className="form-col-box">
                <FormItem {...formLayout_two} label="中文">
                  {getFieldDecorator('desc_cn', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input.TextArea placeholder="请输入200字以内" rows={4} maxLength={200} />)}
                  <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                    <a onClick={() => { utils.translator(form, 'desc') }}>翻译</a>
                  </span>
                </FormItem>
                <FormItem {...formLayout_two} label="英文">
                  {getFieldDecorator('desc_en', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input.TextArea placeholder="请输入200字以内" rows={4} maxLength={200} />)}
                </FormItem>
                <FormItem {...formLayout_two} label="柬文">
                  {getFieldDecorator('desc_kh', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input.TextArea placeholder="请输入200字以内" rows={4} maxLength={200} />)}
                </FormItem>
              </div>
            </FormItem>
            <FormItem {...formLayoutWithOutLabel}>
              {
                verify_status != 1 && (
                  <div>
                    <Button type="primary" htmlType="submit" loading={submitLoading}>保存</Button>
                    <Button style={{ marginLeft: 8 }} onClick={goBack}>取消</Button>
                  </div>
                )
              }
            </FormItem>
          </Form>
        </div>
      </Card>
    );
  }
}

export default MerchantInfo;
