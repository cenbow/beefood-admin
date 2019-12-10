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
  DatePicker,
  TimePicker,
  Checkbox,
} from 'antd';
import moment from 'moment';
import { getBase64, beforeUpload, goBack } from '@/utils/utils';
import { uploadImage } from '@/services/common';
import ShowImg from '@/components/showImg';
import stylesIndex from './index.less';
import utils from '@/utils/utils';
import DishTag from './DishTag';
import DishAttribute from './DishAttribute';

const FormItem = Form.Item;
const { Option } = Select;
const format = 'HH:mm';

const formLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 6 },
};
const formLayout_two = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const formLayoutWithOutLabel = {
  wrapperCol: { span: 6, offset: 3 },
};

let key_num = 1;
let dish_specification_list_key_num = 1;
let dish_specification_list = [];
let attribute_key_num = 1;
let sale_period_type_key_num = 1;
let showAttributeName = [''];
let edit_attribute_key = '';
let sale_period_time = [];

@connect(({ common, mdish, loading }) => ({
  common,
  mdish,
  loading: loading.effects['mdish/fetchSaveMdish'],
  showInfoLoading: loading.effects['mdish/fetchMdishDetails'],
}))
@Form.create()
class MerchantCreate extends Component {
  state = {
    merchant_id: '',
    edit_id: '',
    title: '新增',
    previewVisible: false,
    previewImage: '',
    fileList: [],
    dishCategory: false,
    dishTagModal: false,
    showCategoryGroup: '',
    showCategory: {
      id: '',
      name: '',
      validateStatus: '',
      msg: '',
    },
    edit_tag_ids: [],
    showTagVal: [],
    showTagName: '',
    dishAttributeModal: false,
    showAttributeVal: [],
    image_domain: '',
    image: '',
    sale_time_id: '',
  };
  componentWillMount() {
    const { dispatch, location, match } = this.props;
    let query = location.query;
    
    // 获取商品分类
    dispatch({
      type: 'mdish/getMcategoryList',
      payload: {
        merchant_id: query.merchant_id,
      },
      callback: res => {
        if (res.code == 200 && match.params.id == 'edit') {
          this.getMdishInfo(query.id);
        }
      },
    });
  }
  componentDidMount() {
    // console.log(window.g_app._store.getState());

    const { dispatch, location, match } = this.props;
    let query = location.query;

    this.setState({
      merchant_id: query.merchant_id,
    });

    // 编辑页面
    if (match.params.id == 'edit') {
      this.setState({
        title: '编辑',
      });
      // 获取商品信息

      // this.getMdishInfo(query.id);
    }
  }

  componentWillUnmount() {
    key_num = 1;
    dish_specification_list_key_num = 1;
    dish_specification_list = [];
    attribute_key_num = 1;
    sale_period_type_key_num = 1;
    showAttributeName = [''];
    edit_attribute_key = '';
    sale_period_time = [];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.common && nextProps.common.commonConfig.image_domain) {
      this.setState({
        image_domain: nextProps.common.commonConfig.image_domain,
      });
    }
  }

  getMdishInfo = id => {
    const {
      dispatch,
      form,
      common: {
        commonConfig: { image_domain },
      },
    } = this.props;
    this.setState({
      edit_id: id,
    });
    // 获取商品分类
    dispatch({
      type: 'mdish/fetchMdishDetails',
      payload: { id: id },
      callback: res => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        console.log(data);
        // 赋值
        this.setState({
          image: data.images[0].image,
          previewImage: this.state.image_domain + data.images[0].image,
          fileList: [
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: this.state.image_domain + data.images[0].image,
            },
          ],
          sale_time_id: data.sale_time && data.sale_time.id,
        });
        form.setFieldsValue({
          name_cn: data.name_cn,
          name_en: data.name_en,
          name_kh: data.name_kh,
          desc_cn: data.desc_cn,
          desc_en: data.desc_en,
          desc_kh: data.desc_kh,
          quantity_status: `${data.quantity_status}`,
          specification_type: `${data.specification_type}`,
          status: `${data.status}`,
          sale_date_type: `${data.sale_date_type}`,
        });

        // 商品分类
        this.saveCategory(data.dish_category_id);

        // 商品标签
        let tags_arr = data.tags;
        let edit_tag_ids = [];
        let tag_ids = [];
        for (let t = 0; t < tags_arr.length; t++) {
          tag_ids.push(tags_arr[t].dish_tag_template_id);
          edit_tag_ids.push(tags_arr[t].id);
        }
        let tag_name = '';
        tag_ids.forEach((val, i) => {
          tags_arr.forEach(el => {
            if (val == el.dish_tag_template_id) {
              if (i == tag_ids.length - 1) {
                tag_name += el.name_cn;
              } else {
                tag_name += el.name_cn + '/';
              }
            }
          });
        });
        let tags_data = {
          id: edit_tag_ids,
          value: tag_ids,
          name: tag_name,
        };
        this.saveDishTag(tags_data);

        // 商品规格
        if (data.specification_type == '2') {
          // dish_specification_list_key
          // dish_specification_list
          let dish_sp_list_key = [];
          data.specification.forEach((el, i) => {
            dish_sp_list_key.push(i);
            dish_specification_list.push(el);
          });
          form.setFieldsValue({
            dish_specification_list_key: dish_sp_list_key,
          });
          dish_specification_list_key_num = dish_sp_list_key.length;
        } else if (data.specification_type == '1') {
          if (data.quantity_status == 1) {
            form.setFieldsValue({
              price: utils.handleMoney(data.price, 0),
              lunch_box_fee: utils.handleMoney(data.lunch_box_fee, 0),
            });
          }else{
            form.setFieldsValue({
              price: utils.handleMoney(data.price, 0),
              lunch_box_fee: utils.handleMoney(data.lunch_box_fee, 0),
              quantity: data.quantity,
            });
          }
        }
        // 商品属性
        // attribute_key
        // showAttributeName
        let dish_attribute_key = [];
        if (data.attribute.length > 0) {
          showAttributeName = data.attribute;
          data.attribute.forEach((el, i) => {
            dish_attribute_key.push(i);
          });
        } else {
          dish_attribute_key = [0];
        }
        form.setFieldsValue({
          attribute_key: dish_attribute_key,
        });
        attribute_key_num = dish_attribute_key.length;

        // 限时销售
        //sale_period_type_key
        //sale_period_time
        if (data.sale_date_type == '2') {
          form.setFieldsValue({
            sale_start_time: moment(new Date(data.sale_time.sale_start_time * 1000), 'YYYY-MM-DD'),
            sale_end_time: moment(new Date(data.sale_time.sale_end_time * 1000), 'YYYY-MM-DD'),
            week: data.sale_time.week.split(','),
            sale_period_type: `${data.sale_time.sale_period_type}`,
          });
          if (data.sale_time.sale_period_type == '2') {
            let dish_sale_period_type_key = [];
            data.sale_time.period.forEach((el, i) => {
              dish_sale_period_type_key.push(i);
              sale_period_time.push(el);
            });
            console.log(sale_period_time);
            form.setFieldsValue({
              sale_period_type_key: dish_sale_period_type_key,
            });
            // form.setFieldsValue({
            //   sale_start_time: moment(data.sale_time.period.start_time, 'HH:mm'),
            //   sale_end_time: moment(data.sale_time.period.end_time, 'HH:mm'),
            // });
          }
        }

      },
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = () => {
    this.setState({
      previewImage: this.state.previewImage,
      previewVisible: true,
    });
  };

  handleChange = ({ fileList }) => {
    const {
      common: { commonConfig },
      form,
    } = this.props;
    this.setState({ fileList });

    if (!fileList.length > 0) return;
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        this.setState(
          {
            previewImage: commonConfig.image_domain + res.data.items.path,
          },
          () => {
            form.setFieldsValue({
              image_list: res.data.items.path,
            });
          }
        );
      }
    });
  };

  // 商家分类级联
  onChange = value => {
    console.log(value);
  };

  // 商品分类弹窗
  handleCategoryModal = (flag, id) => {
    this.setState({
      dishCategory: !!flag,
      showCategoryGroup: '',
    });
    if (id) {
      this.setState({
        showCategoryGroup: id,
      });
    }
  };

  // 选择分类
  onCategoryGroup = e => {
    console.log(e.target.value);
    this.setState({
      showCategoryGroup: e.target.value,
    });
  };

  // 保存分类
  saveCategory = category_id => {
    const {
      mdish: { mcategoryList },
    } = this.props;
    // console.log(toString.call(category_id));
    // console.log(mcategoryList);

    // if (category_id){
    //   setTimeout(() => {
    //     if (mcategoryList.list.length > 0){
    //       this.saveCategory(category_id)
    //     }
    //   }, 800);
    // }
    // console.log(category_id);
    // console.log(this.state.showCategoryGroup);
    var id;
    if (toString.call(category_id) != '[object Object]') {
      id = category_id;
    } else {
      id = this.state.showCategoryGroup;
    }
    // const id = category_id || this.state.showCategoryGroup;
    (mcategoryList.list || []).forEach(el => {
      if (el.id == id) {
        this.setState({
          showCategory: {
            id: id,
            name: el.name,
            validateStatus: 'success',
          },
        });
      }
    });
    this.handleCategoryModal(false);
  };

  // 商品标签弹窗
  handleTagModal = flag => {
    this.setState({
      dishTagModal: !!flag,
    });
  };

  // 保存商品标签
  saveDishTag = data => {
    // console.log(data);
    this.setState({
      edit_tag_ids: data['edit_tag_ids'],
      showTagVal: data['value'],
      showTagName: data['name'],
    });
    this.props.form.setFieldsValue({ tag_ids: data['value'].join(',') });
  };

  // 加载多商品规格
  renderDishSpecification = () => {
    const { form, mdishDetails } = this.props;

    // 添加多项事件--商品规格
    const remove_dish_specification_list = k => {
      const keys = form.getFieldValue('dish_specification_list_key');
      if (keys.length === 0) {
        return;
      }
      form.setFieldsValue({
        dish_specification_list_key: keys.filter(key => key !== k),
      });
    };
    const add_dish_specification_list = () => {
      const keys = form.getFieldValue('dish_specification_list_key');
      const nextKeys = keys.concat(dish_specification_list_key_num++);
      form.setFieldsValue({
        dish_specification_list_key: nextKeys,
      });
    };
    form.getFieldDecorator('dish_specification_list_key', { initialValue: [0] });
    const dish_specification_list_key = form.getFieldValue('dish_specification_list_key');
    const dish_specification_list_demo = dish_specification_list_key.map((k, index) => (
      <FormItem {...formLayoutWithOutLabel} key={k}>
        <div className="form-col-box" style={{ width: 485 }}>
          <div>
            <span>规格{index + 1}</span>
            <a style={{ float: 'right' }}>
              {index === 0 ? (
                <span onClick={add_dish_specification_list}>新增</span>
              ) : (
                <span onClick={() => remove_dish_specification_list(k)} style={{ color: 'red' }}>
                  删除
                </span>
              )}
            </a>
          </div>
          <FormItem>
            <span className="ant-form-item-required">中文：</span>
            {form.getFieldDecorator(`dish_specification_list[${k}][name_cn]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: dish_specification_list[k] && dish_specification_list[k]['name_cn'],
            })(<Input style={{ width: '80%' }} placeholder="请输入中文规格名称（20字以内）" maxLength={20} />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, `dish_specification_list[${k}][name`,'array') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem>
            <span className="ant-form-item-required">英文：</span>
            {form.getFieldDecorator(`dish_specification_list[${k}][name_en]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: dish_specification_list[k] && dish_specification_list[k]['name_en'],
            })(<Input style={{ width: '80%' }} placeholder="请输入英文规格名称（20字以内）" />)}
          </FormItem>
          <FormItem>
            <span className="ant-form-item-required">柬文：</span>
            {form.getFieldDecorator(`dish_specification_list[${k}][name_kh]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: dish_specification_list[k] && dish_specification_list[k]['name_kh'],
            })(<Input style={{ width: '80%' }} placeholder="请输入柬文规格名称（20字以内）" />)}
          </FormItem>
          <div style={{ width: 560 }}>
            <FormItem style={{ display: 'inline-block', marginRight: 12 }}>
              <span className="ant-form-item-required">价格($)</span>
              {form.getFieldDecorator(`dish_specification_list[${k}][price]`, {
                rules: [{ required: true, message: '请输入价格！' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
                initialValue: dish_specification_list[k] && utils.handleMoney(dish_specification_list[k]['price'], 0),
              })(<Input style={{ margin: '0 5px', width: 65 }} />)}
            </FormItem>
            <FormItem style={{ display: 'inline-block', marginRight: 12 }}>
              <span className="ant-form-item-required">打包费($)</span>
              {form.getFieldDecorator(`dish_specification_list[${k}][lunch_box_fee]`, {
                rules: [{ required: true, message: '请输入打包费！' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
                initialValue: dish_specification_list[k] && utils.handleMoney(dish_specification_list[k]['lunch_box_fee'], 0),
              })(<Input style={{ margin: '0 5px', width: 65 }} />)}
            </FormItem>
            {form.getFieldValue('quantity_status') == '2' ? (
              <FormItem style={{ display: 'inline-block', marginRight: 12 }}>
                <span className="ant-form-item-required">库存</span>
                {form.getFieldDecorator(`dish_specification_list[${k}][quantity]`, {
                  rules: [{ required: true, message: '请输入库存！' }, { message: '请输入正整数！', pattern: utils.isIntNum() }],
                initialValue:
                  dish_specification_list[k] && dish_specification_list[k]['quantity'],
                })(<Input style={{ margin: '0 5px', width: 65 }} maxLength={4} />)}
              </FormItem>
            ) : null}
          </div>
        </div>
      </FormItem>
    ));
    return dish_specification_list_demo;
  };

  // 商品属性弹窗
  handleAttributeModal = (flag, k, showVal) => {
    console.log(k);
    console.log('showVal',showVal);
    edit_attribute_key = k;
    this.setState({
      dishAttributeModal: !!flag,
      showAttributeVal: showVal || '',
    });
  };

  // 保存商品属性
  saveDishAttribute = data => {
    // console.log(data);
    if (showAttributeName.hasOwnProperty(edit_attribute_key)) {
      showAttributeName.splice(edit_attribute_key, 1, data);
    } else {
      showAttributeName.push(data);
    }
  };

  // 显示限时售卖
  renderSaleDateType = () => {
    const { form, mdishDetails } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <div className="form-col-box" style={{ width: 485 }}>
        <FormItem>
          <span className="ant-form-item-required">售卖日期：</span>
          <FormItem style={{ display: 'inline-block', width: 'calc(30% - 12px)' }}>
            {getFieldDecorator('sale_start_time', {
              rules: [{ required: true, message: '必填' }],
            })(<DatePicker placeholder="开始日期" />)}
          </FormItem>
          <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>至</span>
          <FormItem style={{ display: 'inline-block', width: 'calc(30% - 12px)' }}>
            {getFieldDecorator('sale_end_time', {
              rules: [{ required: true, message: '必填' }],
            })(<DatePicker placeholder="结束日期" />)}
          </FormItem>
        </FormItem>
        <FormItem>
          <span className="ant-form-item-required"> 售卖日：</span>
          <FormItem style={{ display: 'inline-block' }}>
            {getFieldDecorator('week', {
              rules: [{ required: true, message: '必填' }],
            })(
              <Checkbox.Group style={{ width: 350 }}>
                <Checkbox value="1">周一</Checkbox>
                <Checkbox value="2">周二</Checkbox>
                <Checkbox value="3">周三</Checkbox>
                <Checkbox value="4">周四</Checkbox>
                <Checkbox value="5">周五</Checkbox>
                <Checkbox value="6">周六</Checkbox>
                <Checkbox value="0">周日</Checkbox>
              </Checkbox.Group>
            )}
          </FormItem>
        </FormItem>
        <FormItem>
          <span className="ant-form-item-required">售卖时段：</span>
          {getFieldDecorator('sale_period_type', {
            rules: [{ required: true, message: '必填' }],
            initialValue: '1',
          })(
            <Radio.Group>
              <Radio value="1">全天售卖</Radio>
              <Radio value="2">指定时间售卖</Radio>
            </Radio.Group>
          )}
        </FormItem>
        {getFieldValue('sale_period_type') == '2' ? this.renderSalePeriodType() : null}
      </div>
    );
  };

  renderSalePeriodType = () => {
    const { form, mdishDetails } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    console.log(sale_period_time);
    // 指定时间段售卖
    const remove_sale_period_type = k => {
      const keys = form.getFieldValue('sale_period_type_key');
      if (keys.length === 0) {
        return;
      }
      form.setFieldsValue({
        sale_period_type_key: keys.filter(key => key !== k),
      });
    };
    const add_sale_period_type = () => {
      const keys = form.getFieldValue('sale_period_type_key');
      const nextKeys = keys.concat(sale_period_type_key_num++);
      form.setFieldsValue({
        sale_period_type_key: nextKeys,
      });
    };
    form.getFieldDecorator('sale_period_type_key', { initialValue: [0] });
    const sale_period_type_key = form.getFieldValue('sale_period_type_key');
    const sale_period_type_demo = sale_period_type_key.map((k, index) => (
      <FormItem key={k}>
        {sale_period_time.length > 0 ? (
          <FormItem style={{ display: 'inline-block' }}>
            {form.getFieldDecorator(`sale_time_schedule[${k}][start_time]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: moment(sale_period_time[k] && sale_period_time[k].start_time, 'HH:mm'),
            })(<TimePicker format={format} />)}
          </FormItem>
        ) : (
          <FormItem style={{ display: 'inline-block' }}>
            {form.getFieldDecorator(`sale_time_schedule[${k}][start_time]`, {
              rules: [{ required: true, message: '必填' }],
            })(<TimePicker format={format} />)}
          </FormItem>
        )}

        <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>至</span>

        {sale_period_time.length > 0 ? (
          <FormItem style={{ display: 'inline-block' }}>
            {form.getFieldDecorator(`sale_time_schedule[${k}][end_time]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: moment(sale_period_time[k] && sale_period_time[k].end_time, 'HH:mm'),
            })(<TimePicker format={format} />)}
          </FormItem>
        ) : (
          <FormItem style={{ display: 'inline-block' }}>
            {form.getFieldDecorator(`sale_time_schedule[${k}][end_time]`, {
              rules: [{ required: true, message: '必填' }],
            })(<TimePicker format={format} />)}
          </FormItem>
        )}
        {index === 0 ? (
          <Icon
            className="dynamic-button"
            type="plus-circle"
            title="新增"
            onClick={add_sale_period_type}
          />
        ) : (
          <Icon
            className="dynamic-button"
            type="minus-circle-o"
            title="删除"
            onClick={() => remove_sale_period_type(k)}
          />
        )}
      </FormItem>
    ));
    return sale_period_type_demo;
  };

  // 商品--提交表单
  handleSubmit = e => {
    e.preventDefault();
    const { dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      console.log(values);
      
      //判断是否选择了商品分类
      if (!this.state.showCategory.id) {
        this.setState({
          showCategory: {
            ...this.state.showCategory,
            validateStatus: 'error',
            msg: '请选择商家分类！',
          },
        });
        return;
      }

      if (!err) {
        // console.log('Received values of form: ', values);
        let formData = new FormData();
        formData.append('merchant_id', this.state.merchant_id);
        Object.keys(values).forEach(key => {
          formData.append(key, values[key] || '');
        });
        // console.log(values['image_list']);
        formData.delete('image_list');
        formData.append('image_list[0]', values['image_list']);

        // 商品分类
        formData.append('dish_category_id', this.state.showCategory.id);

        // 商品规格
        if (values.specification_type == '1') {
          formData.append('dish_specification_list[0][price]', utils.handleMoney(values.price, 1));
          formData.append('dish_specification_list[0][lunch_box_fee]', utils.handleMoney(values.lunch_box_fee, 1));
          if (values.quantity_status != '1') {
            formData.append('dish_specification_list[0][quantity]', values.quantity);
          }
        } else {
          let specification_data = values.dish_specification_list_key.map(
            key => values.dish_specification_list[key]
          );
          for (let s = 0; s < specification_data.length; s++) {
            Object.keys(specification_data[s]).forEach(key => {
              if (key == "price" || key == "lunch_box_fee") {
                formData.append(`dish_specification_list[${s}][${key}]`, utils.handleMoney(specification_data[s][key], 1));
              } else {
                formData.append(`dish_specification_list[${s}][${key}]`, specification_data[s][key]);
              }
            });
          }
        }

        // 商品属性
        if (showAttributeName.length > 0) {
          let attribute_data = values.attribute_key.map(key => showAttributeName[key]);
          if (attribute_data[0]) {
            for (let i = 0; i < attribute_data.length; i++) {
              formData.append(`dish_attribute_list[${i}][id]`, attribute_data[i]['id']);
              formData.append(`dish_attribute_list[${i}][name_cn]`, attribute_data[i]['name_cn']);
              formData.append(`dish_attribute_list[${i}][name_en]`, attribute_data[i]['name_en']);
              formData.append(`dish_attribute_list[${i}][name_kh]`, attribute_data[i]['name_kh']);
              for (let index = 0; index < attribute_data[i]['tag_list'].length; index++) {
                formData.append(`dish_attribute_list[${i}][tag_list][${index}][id]`, attribute_data[i]['tag_list'][index]['id']);
                formData.append(
                  `dish_attribute_list[${i}][tag_list][${index}][name_cn]`,
                  attribute_data[i]['tag_list'][index]['name_cn']
                );
                formData.append(
                  `dish_attribute_list[${i}][tag_list][${index}][name_en]`,
                  attribute_data[i]['tag_list'][index]['name_en']
                );
                formData.append(
                  `dish_attribute_list[${i}][tag_list][${index}][name_kh]`,
                  attribute_data[i]['tag_list'][index]['name_kh']
                );
              }
            }
          } else {
            formData.append(`dish_attribute_list`, '');
          }
        }

        // 销售时间
        if (values.sale_date_type == '1') {
          formData.append('sale_time[]', '');
        } else {
          formData.delete('sale_start_time');
          formData.delete('sale_end_time');
          formData.append('sale_time[sale_period_type]', values.sale_period_type);
          formData.append('sale_time[sale_start_time]', utils.getDateTime(values['sale_start_time']));
          formData.append('sale_time[sale_end_time]', utils.getEndDateTime(values['sale_end_time']));
          formData.append('sale_time[week]', values.week.join(','));
          formData.append('sale_time[id]', this.state.sale_time_id);

          if (values.sale_period_type == '2') {
            let sale_time_schedule_data = values.sale_period_type_key.map(
              key => values.sale_time_schedule[key]
            );
            console.log(sale_time_schedule_data.length);
            for (let sale = 0; sale < sale_time_schedule_data.length; sale++) {
              formData.append(
                `sale_time[sale_time_schedule][${sale}][start_time]`,
                sale_time_schedule_data[sale]['start_time'].format('HH:mm')
              );
              formData.append(
                `sale_time[sale_time_schedule][${sale}][end_time]`,
                sale_time_schedule_data[sale]['end_time'].format('HH:mm')
              );
            }
            for (let arr = 0; arr < sale_period_time.length; arr++) {
              if (arr <= sale_time_schedule_data.length) {
                formData.append(
                  `sale_time[sale_time_schedule][${arr}][id]`,
                  sale_period_time[arr].id
                );
              }
            }
          }
        }
        // 提交事件
        if (this.state.edit_id) {
          formData.append('id', this.state.edit_id);
          dispatch({
            type: 'mdish/fetchEditMdish',
            payload: formData,
            callback: res => {
              if (!utils.successReturn(res)) return;
              message.success('保存成功');
              router.goBack();
            },
          });
        } else {
          dispatch({
            type: 'mdish/fetchSaveMdish',
            payload: formData,
            callback: res => {
              if (!utils.successReturn(res)) return;
              message.success('新增成功');
              router.goBack();
            },
          });
        }
      }
    });
  };

  render() {
    const {
      form,
      mdish: { mcategoryList },
      mdishDetails,
      loading,
      showInfoLoading,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { title, previewVisible, previewImage, fileList, showCategory, showTagName } = this.state;
    
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    // 添加多项事件--商品属性
    const remove_dish_attribute_list = k => {
      const keys = form.getFieldValue('attribute_key');
      if (keys.length === 0) {
        return;
      }
      form.setFieldsValue({
        attribute_key: keys.filter(key => key !== k),
      });
      showAttributeName.forEach((el,i) => {
        if (i == k) {
          el = '';
        }
      });
      // console.log(showAttributeName);
    };
    const add_dish_attribute_list = () => {
      const keys = form.getFieldValue('attribute_key');
      const nextKeys = keys.concat(attribute_key_num++);
      form.setFieldsValue({
        attribute_key: nextKeys,
      });
      showAttributeName.push('');
      // console.log(showAttributeName);
    };
    form.getFieldDecorator('attribute_key', { initialValue: [0] });
    const attribute_key = form.getFieldValue('attribute_key');
    const dish_attribute_list_FormItems = attribute_key.map((k, index) => (
      <FormItem
        {...(index === 0 ? formLayout : formLayoutWithOutLabel)}
        label={index === 0 ? '商品属性' : ''}
        key={k}
      >
        <span
          className="selectInput"
          onClick={() => {
            this.handleAttributeModal(true, k, showAttributeName[k] && showAttributeName[k]);
          }}
        >
          {showAttributeName[k] && showAttributeName[k]['name_cn'] != '' ? (
            <span
              className="input-text"
              title={showAttributeName[k] && showAttributeName[k]['name_cn']}
            >
              {showAttributeName[k] &&
                showAttributeName[k]['name_cn'] +
                  '(' +
                  (showAttributeName[k]['tag_list'] || []).map((item, i) => {
                    let name = '';
                    name += item.name_cn;
                    return name;
                  }) +
                  ')'}
            </span>
          ) : (
            <span className="input-placeholder">请选择商品属性</span>
          )}
          <span className="input-suffix">
            <Icon type="down" />
          </span>
        </span>
        {
          (attribute_key.length > 0 && attribute_key.length != index+1) && (
            <Icon
              className="dynamic-button"
              type="minus-circle-o"
              title="删除"
              onClick={() => remove_dish_attribute_list(k)}
            />
          )
        }
        {
          attribute_key.length == index + 1 && (
            <span>
              <Icon
                className="dynamic-button"
                type="plus-circle"
                title="新增"
                onClick={add_dish_attribute_list}
              />
              {
                index != 0 && (
                  <Icon
                    className="dynamic-button"
                    type="minus-circle-o"
                    title="删除"
                    onClick={() => remove_dish_attribute_list(k)}
                  />
                )
              }
            </span>
          )
        }
        {/* {index === 0 ? (
          <Icon
            className="dynamic-button"
            type="plus-circle"
            title="新增"
            onClick={add_dish_attribute_list}
          />
        ) : (
          <Icon
            className="dynamic-button"
            type="minus-circle-o"
            title="删除"
            onClick={() => remove_dish_attribute_list(k)}
          />
        )} */}
      </FormItem>
    ));

    return (
      <Card bordered={false} loading={showInfoLoading}>
        <div className="page_head">
          <span className="page_head_title">
            <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => router.goBack()}
            />{title}商品
          </span>
        </div>
        <div>
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formLayout} label="商品图片">
              {getFieldDecorator('image_list', {
                rules: [{ required: true, message: '必填' }],
                initialValue: this.state.image,
              })(
                <div style={{ height: 112 }}>
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => {return false;}}
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    accept="image/png, image/jpeg"
                    className="upload-img"
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                </div>
              )}
              <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </FormItem>
            <Row className="ant-form-item">
              <Col span={3} className="col-label">
                <span>商品名称：</span>
              </Col>
              <Col span={8}>
                <div className="form-col-box" style={{ width: 485 }}>
                  <FormItem {...formLayout_two} label="商品名称">
                    {getFieldDecorator('name_cn', {
                      rules: [{ required: true, message: '必填' }],
                    })(<Input placeholder="请输入" maxLength={20} />)}
                    <span
                      className="ant-form-text"
                      style={{ position: 'absolute', right: '-44px' }}
                    >
                      <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
                    </span>
                  </FormItem>
                  <FormItem {...formLayout_two} label="英文">
                    {getFieldDecorator('name_en', {
                      rules: [{ required: true, message: '必填' }],
                    })(<Input placeholder="请输入" maxLength={20} />)}
                  </FormItem>
                  <FormItem {...formLayout_two} label="柬文">
                    {getFieldDecorator('name_kh', {
                      rules: [{ required: true, message: '必填' }],
                    })(<Input placeholder="请输入" maxLength={20} />)}
                  </FormItem>
                </div>
              </Col>
            </Row>
            <Row className="ant-form-item">
              <Col span={3} className="col-label">
                <span>商品描述：</span>
              </Col>
              <Col span={8}>
                <div className="form-col-box" style={{ width: 485 }}>
                  <FormItem {...formLayout_two} label="中文">
                    {getFieldDecorator('desc_cn', {
                      rules: [{ required: true, message: '必填' }],
                    })(<Input.TextArea placeholder="请输入200字内" rows={4} maxLength={200} />)}
                    <span
                      className="ant-form-text"
                      style={{ position: 'absolute', right: '-44px' }}
                    >
                      <a onClick={() => { utils.translator(form, 'desc') }}>翻译</a>
                    </span>
                  </FormItem>
                  <FormItem {...formLayout_two} label="英文">
                    {getFieldDecorator('desc_en', {
                      rules: [{ required: true, message: '必填' }],
                    })(<Input.TextArea placeholder="请输入200字内" rows={4} maxLength={200} />)}
                  </FormItem>
                  <FormItem {...formLayout_two} label="柬文">
                    {getFieldDecorator('desc_kh', {
                      rules: [{ required: true, message: '必填' }],
                    })(<Input.TextArea placeholder="请输入200字内" rows={4} maxLength={200} />)}
                  </FormItem>
                </div>
              </Col>
            </Row>
            <FormItem
              {...formLayout}
              label="商品分类"
              validateStatus={showCategory.validateStatus}
              help={showCategory.msg}
              required
            >
              <span
                className="selectInput"
                onClick={() => {
                  this.handleCategoryModal(true, showCategory.id);
                }}
              >
                {showCategory.id != '' ? (
                  <span className="input-text" title={showCategory.name}>
                    {showCategory.name}
                  </span>
                ) : (
                  <span className="input-placeholder">请选择商品分类</span>
                )}
                <span className="input-suffix">
                  <Icon type="down" />
                </span>
              </span>
            </FormItem>
            <FormItem {...formLayout} label="商品标签">
              {getFieldDecorator('tag_ids', {
                rules: [{ required: true, message: '请输入商品标签！' }],
              })(
                <span
                  className="selectInput"
                  onClick={() => {
                    this.handleTagModal(true);
                  }}
                >
                  <Input className="hiddenInput" />
                  {showTagName != '' ? (
                    <span className="input-text" title={showTagName}>
                      {showTagName}
                    </span>
                  ) : (
                    <span className="input-placeholder">请选择商品标签</span>
                  )}
                  <span className="input-suffix">
                    <Icon type="down" />
                  </span>
                </span>
              )}
            </FormItem>
            <FormItem {...formLayout} label="库存类型">
              {getFieldDecorator('quantity_status', {
                rules: [{ required: true, message: '请选择库存类型！' }],
                initialValue: '2',
              })(
                <Radio.Group>
                  <Radio value="2">有限库存</Radio>
                  <Radio value="1">无限库存</Radio>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem {...formLayout} label="商品规格">
              {getFieldDecorator('specification_type', {
                rules: [{ required: true, message: '请选择商品规格！' }],
                initialValue: '1',
              })(
                <Radio.Group>
                  <Radio value="1">非多规格</Radio>
                  <Radio value="2">多规格</Radio>
                </Radio.Group>
              )}
            </FormItem>
            {getFieldValue('specification_type') == '1' ? (
              <FormItem {...formLayoutWithOutLabel}>
                {/* 非多规格 */}
                <div style={{ width: 560 }}>
                  <FormItem style={{ display: 'inline-block', marginRight: 12 }}>
                    <span className="ant-form-item-required">价格($)</span>
                    {getFieldDecorator('price', {
                      rules: [
                        { 
                          required: true,
                          message: '请输入价格！',
                        }, {
                          message: '请输入正确的金额格式！',
                          pattern: utils.isMoney(),
                        }
                      ],
                    })(<Input style={{ margin: '0 5px', width: 65 }} />)}
                  </FormItem>
                  <FormItem style={{ display: 'inline-block', marginRight: 12 }}>
                    <span className="ant-form-item-required">打包费($)</span>
                    {getFieldDecorator('lunch_box_fee', {
                      rules: [{ required: true, message: '请输入打包费！' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
                    })(<Input style={{ margin: '0 5px', width: 65 }} />)}
                  </FormItem>
                  {getFieldValue('quantity_status') == '2' ? (
                    <FormItem style={{ display: 'inline-block', marginRight: 12 }}>
                      <span className="ant-form-item-required">库存</span>
                      {getFieldDecorator('quantity', {
                        rules: [{ required: true, message: '请输入库存！' }, { message: '请输入正整数！', pattern: utils.isIntNum() }],
                      })(<Input style={{ margin: '0 5px', width: 65 }} maxLength={4} />)}
                    </FormItem>
                  ) : null}
                </div>
              </FormItem>
            ) : (
              <div>
                {/* 多规格 */}
                {this.renderDishSpecification()}
              </div>
            )}

            {/* 商品属性 */}
            {dish_attribute_list_FormItems}

            <FormItem {...formLayout} label="上架状态">
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择上架状态！' }],
                initialValue: '1',
              })(
                <Radio.Group>
                  <Radio value="1">上架</Radio>
                  <Radio value="2">下架</Radio>
                </Radio.Group>
              )}
            </FormItem>

            <FormItem {...formLayout} label="售卖时间">
              <div>(默认全时段售卖，可自定义售卖时间)</div>
              {getFieldDecorator('sale_date_type', {
                rules: [{ required: true, message: '请选择售卖时间！' }],
                initialValue: '1',
              })(
                <Radio.Group>
                  <Radio value="1">全时段售卖</Radio>
                  <Radio value="2">限时售卖</Radio>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem {...formLayoutWithOutLabel}>
              {getFieldValue('sale_date_type') == '2' ? this.renderSaleDateType() : null}
            </FormItem>

            <FormItem {...formLayoutWithOutLabel}>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={goBack}>
                取消
              </Button>
            </FormItem>
          </Form>
        </div>

        {/* 商品分类 */}
        <Modal
          width={460}
          destroyOnClose
          title="商品分类"
          visible={this.state.dishCategory}
          onOk={this.saveCategory}
          onCancel={() => {
            this.handleCategoryModal(false);
          }}
        >
          {
            (mcategoryList.list || []).length == 0 && (
              <h4>请返回列表页面添加商品分类哦(￣^￣゜)</h4>
            )
          }
          <Radio.Group
            className={stylesIndex.modal_category_ul}
            name="categoryGroup"
            onChange={this.onCategoryGroup}
            value={this.state.showCategoryGroup}
          >
            {(mcategoryList.list || []).map((item, i) => (
              <div key={i} className={stylesIndex.modal_category_item}>
                <Radio value={item.id} className={stylesIndex.modal_category_radio}>
                  {item.name}
                </Radio>
                {/* <span className={stylesIndex.icon_btn}>
                    <Icon type="edit" title="编辑" className={`${stylesIndex.anticon} ${stylesIndex.anticon_edit}`} onClick={() => this.handleModalVisible(true, item.id)} />
                    <Icon type="vertical-align-top" title="置顶" className={`${stylesIndex.anticon} ${stylesIndex.anticon_edit}`} onClick={() => this.removeClassfy(item.id)} />
                    <Icon type="close" title="删除" className={`${stylesIndex.anticon} ${stylesIndex.anticon_close}`} onClick={() => this.removeClassfy(item.id)} />
                  </span> */}
              </div>
            ))}
          </Radio.Group>
        </Modal>

        {/* 商品标签 */}
        {this.state.dishTagModal && (
          <DishTag
            visible={this.state.dishTagModal}
            onOk={this.saveDishTag}
            onCancel={() => {
              this.handleTagModal(false);
            }}
            merchant_id={this.state.merchant_id}
            values={this.state.showTagVal}
          />
        )}
        {/* 商品属性 */}
        {this.state.dishAttributeModal && (
          <DishAttribute
            visible={this.state.dishAttributeModal}
            onOk={this.saveDishAttribute}
            onCancel={() => {
              this.handleAttributeModal(false);
            }}
            merchant_id={this.state.merchant_id}
            values={this.state.showAttributeVal}
          />
        )}
      </Card>
    );
  }
}

export default MerchantCreate;
