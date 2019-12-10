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
import { goBack } from '@/utils/utils';
import {
  getMCategory,
  getCity,
  getRegion,
} from '@/services/common';
import PrefixSelector from '@/components/PrefixSelector/index';
import utils from '@/utils/utils';
import GoogleGeocoding from '@/components/GoogleGeocoding/index';

const FormItem = Form.Item;
const { Option } = Select;

let key_num = 1;
let category_arr = [''];

@connect(({ common, merchant, loading }) => ({
  common,
  merchant,
  loading: loading.models.merchant,
}))
@Form.create()
class MerchantCreate extends Component {
  state = {
    submitLoading: false,
    gps: [104.91667, 11.55],
    citys: [],
    regions: [],
    center: {
      lng: 104.91667,
      lat: 11.55
    },
    zoom: 11,
    modalCategory: false,
    level_1_id: undefined,
    level_2_id: undefined,
    level_3_id: undefined,
    MCategorylevel_2: [],
    MCategorylevel_3: [],
    edit_category_key: '',
  };

  componentDidMount() {
    //获取国家区域数据
    this.getCommon();
    // 获取商家分类分级数据
    this.getLevelMCategory();
  }

  componentWillUnmount() {
    key_num = 1;
    category_arr = [''];
  }

  getCommon = () => {
    const { dispatch } = this.props;
    //获取全部的国家
    dispatch({
      type: 'common/getCountry',
      payload: {},
    });
  };

  // 国家城市区域商圈联动
  selectCountry = id => {
    this.setState({
      citys: [],
      regions: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      city_id: undefined,
      region_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        citys: undefined,
      });
      this.setState({ citys: [] });
      return;
    }
    getCity({
      country_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        citys: res.data.items,
      });
    });
  };
  selectCity = id => {
    this.setState({
      regions: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      region_id: undefined,
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        regions: undefined,
      });
      this.setState({ regions: [] });
      return;
    }
    getRegion({
      city_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        regions: res.data.items,
      });
    });
  };


  // 获取商家分类分级数据
  getLevelMCategory = () => {
    const { dispatch } = this.props;
    // 选择分类
    dispatch({
      type: 'common/getMCategory',
      payload: null,
    });
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
      }, () => {
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
    console.log(gps);
    this.setState({
      gps: [...gps],
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 提醒确认
        Modal.confirm({
          title: '温馨提示',
          content: '确认资料已全部正确填写。',
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
    const { keys, category} = values;
    console.log(values);

    this.setState({ submitLoading: true });

    let formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, values[key] || '');
    });

    formData.append('gps', this.state.gps);

    // 商家分类解构
    let category_data = keys.map(key => category[key]);
    for (let i = 0; i < category_data.length; i++) {
      formData.append(`category[${i}][id]`, category_data[i]['id']);
      formData.append(`category[${i}][category_one_id]`, category_data[i]['category_one_id']);
      formData.append(`category[${i}][category_two_id]`, category_data[i]['category_two_id']);
      formData.append(`category[${i}][category_three_id]`, category_data[i]['category_three_id']);
    }

    // 提交表单
    dispatch({
      type: 'merchant/fetchSaveMerchant',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        router.goBack();
      },
    });
  };

  render() {
    const { form, common } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      citys,
      regions,
      submitLoading,
      MCategorylevel_2,
      MCategorylevel_3,
    } = this.state;
    const { getMCategory = [], country = [] } = common;

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
            />{'新增商家'}
          </span>
        </div>
        <div>
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formLayout} label="商家登录手机号">
              {getFieldDecorator('mobile', {
                rules: [{ required: true, message: '必填' }],
              })(<Input addonBefore={<PrefixSelector form={form} />} placeholder="请输入" />)}
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
                >
                  {citys.map((item, i) => (
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
                >
                  {regions.map((item, i) => (
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
                  })(<Input placeholder="请输入" autoComplete="off" />)}
                  <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                    <a onClick={() => { utils.translator(form, 'address') }}>翻译</a>
                  </span>
                </FormItem>
                <FormItem {...formLayout_two} label="英文">
                  {getFieldDecorator('address_en', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" autoComplete="off" />)}
                </FormItem>
                <FormItem {...formLayout_two} label="柬文">
                  {getFieldDecorator('address_kh', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input placeholder="请输入" autoComplete="off" />)}
                </FormItem>
                <div className="dynamic-button" style={{ right: '-80px' }}>
                  <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
                </div>
              </div>
              <GoogleGeocoding
                onRef={this.onRef}
                onChange={this.onChangeMap}
                style={{ height: 430 }}
                // center={this.state.center}
              />
            </FormItem>
            <FormItem {...formLayoutWithOutLabel}>
              <Button type="primary" htmlType="submit" loading={submitLoading}>保存</Button>
              <Button style={{ marginLeft: 8 }} onClick={goBack}>取消</Button>
            </FormItem>
          </Form>
        </div>
      </Card>
    );
  }
}

export default MerchantCreate;
