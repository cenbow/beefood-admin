import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Modal, Form, Radio, Button, Input, message, Icon } from 'antd';
import utils from '@/utils/utils';
import stylesIndex from './index.less';

const FormItem = Form.Item;
let key_num = 1;
let tag_list_key = [];
let tag_list_value = [];

@connect(({ mdish, loading }) => ({
  mdish,
  loading: loading.models.mdish,
}))
@Form.create()
class DishAttribute extends Component {
  state = {
    dishAttributeModal: false,
    editFormValues: {},
    showTagVal: '',
  };

  componentDidMount() {
    const { values } = this.props;
    console.log(values);
    this.getTagList();
    this.setState({
      showTagVal: values.dish_id,
    });
  }

  componentWillUnmount() {
    key_num = 1;
    tag_list_key = [];
    tag_list_value = [];
  }

  getTagList = () => {
    const { dispatch, merchant_id } = this.props;
    dispatch({
      type: 'mdish/getDishAttributeList',
      payload: {
        merchant_id: merchant_id,
      },
    });
  };

  // 获取信息
  getInfo = (id, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'mdish/fetchDishAttributeInfo',
      payload: { id: id },
      callback: res => {
        if (!utils.successReturn(res)) return;
        this.setState({
          editFormValues: res.data.items,
        });
        res.data.items.tag_list.forEach((el, i) => {
          tag_list_key.push(i);
          tag_list_value.push(el);
        });
        if (callback) callback(res.data.items);
      },
    });
  };

  handleTagModal = (flag, id) => {
    this.props.form.resetFields();
    key_num = 1;
    tag_list_key = [];
    tag_list_value = [];
    this.setState({
      dishAttributeModal: !!flag,
      editFormValues: {},
    });
    if (!id) return;
    this.getInfo(id);
  };

  onChange = e => {
    // console.log(e.target.value);
    this.setState({
      showTagVal: e.target.value,
    });
  };

  // 添加编辑
  saveDishAttribute = () => {
    const { form, dispatch, merchant_id } = this.props;
    const { editFormValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      let formData = new FormData();
      formData.append('merchant_id', merchant_id);
      Object.keys(fieldsValue).forEach(key => {
        formData.append(key, fieldsValue[key] || '');
      });

      // 商家属性选项解构
      let tag_list = fieldsValue.keys.map(key => fieldsValue.tag_list[key]);
      for (let i = 0; i < tag_list.length; i++) {
        formData.append(`tag_list[${i}][name_cn]`, tag_list[i]['name_cn']);
        formData.append(`tag_list[${i}][name_en]`, tag_list[i]['name_en']);
        formData.append(`tag_list[${i}][name_kh]`, tag_list[i]['name_kh']);
      }
      // formData.delete('tag_list');

      if (editFormValues.id) {
        formData.append('id', editFormValues.id);
        dispatch({
          type: 'mdish/fetchEditDishAttribute',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('保存成功');
            this.getTagList();
            this.handleTagModal(false);
            form.resetFields();
          },
        });
      } else {
        dispatch({
          type: 'mdish/fetchSaveDishAttribute',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('添加成功');
            this.getTagList();
            this.handleTagModal(false);
            form.resetFields();
          },
        });
      }
    });
  };

  // 删除
  removeTagModal = id => {
    const { dispatch,values } = this.props;
    Modal.confirm({
      title: '删除属性',
      content: '确定删除此属性？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', id);
        dispatch({
          type: 'mdish/fetchDishAttributeDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getTagList();
          },
        });
      },
    });
  };

  // 直接保存到商品属性中显示
  saveToCommodity = () => {
    const { form, values } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      this.handleTagModal(false);
      // 判断商品属性是否编辑数据
      if (values) {
        fieldsValue.id = values.id;
        fieldsValue.dish_id = '0';
        fieldsValue.tag_list.forEach((el, i) => {
          if (values.tag_list[i]) {
            el.id = values.tag_list[i].id
          }
        });
      } else {
        fieldsValue.id = '0';
      }
      let obj = {
        ...fieldsValue,
      }
      console.log(obj);
      
      this.props.onOk(obj);
      this.props.onCancel();
    });
  };

  onOk = () => {
    const { values } = this.props;
    const { showTagVal, editFormValues } = this.state;
    if (showTagVal == '' || showTagVal == undefined) return message.info('请选择商品属性');
    this.getInfo(showTagVal, fieldsValue => {
      let data = fieldsValue;
      if (values) {
        fieldsValue.dish_id = data.id;
        fieldsValue.id = values.id;
        fieldsValue.tag_list.forEach((el, i) => {
          if (values.tag_list[i]) {
            el.id = values.tag_list[i].id
          }
        });
      } else {
        fieldsValue.id = '0';
      }
      let obj = {
        ...fieldsValue,
      }
      console.log(obj);

      this.props.onOk(obj);
      this.props.onCancel();
    });
  };

  render() {
    const {
      mdish: { dishAttributeList = [] },
      form,
      visible,
      onCancel,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { editFormValues, showTagVal } = this.state;

    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    // 添加多项分类事件
    const removeCategory = k => {
      const keys = getFieldValue('keys');
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    };
    const addCategory = () => {
      const keys = getFieldValue('keys');
      key_num = tag_list_key.length > 0 ? tag_list_key.length : key_num;
      const nextKeys = keys.concat(key_num++);
      form.setFieldsValue({
        keys: nextKeys,
      });
    };
    getFieldDecorator('keys', { initialValue: tag_list_key.length > 0 ? tag_list_key : [0] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <FormItem {...formLayout} required key={k}>
        <div className="form-col-box" style={{ width: 389 }}>
          <div>
            <div>选项{index + 1}</div>
            <FormItem>
              <span>中文：</span>
              {getFieldDecorator(`tag_list[${k}][name_cn]`, {
                rules: [{ required: true, message: '必填' }],
                initialValue: (tag_list_value[k] && tag_list_value[k]['name_cn']) || '',
              })(
                <Input style={{ width: '80%' }} placeholder="请输入名称（10字内）" maxLength={10} />
              )}
              <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                <a onClick={() => { utils.translator(form, `tag_list[${k}][name`, 'array') }}>翻译</a>
              </span>
            </FormItem>
            <FormItem>
              <span>英文：</span>
              {getFieldDecorator(`tag_list[${k}][name_en]`, {
                rules: [{ required: true, message: '必填' }],
                initialValue: (tag_list_value[k] && tag_list_value[k]['name_en']) || '',
              })(<Input style={{ width: '80%' }} placeholder="请输入名称（10字内）" />)}
            </FormItem>
            <FormItem>
              <span>柬文：</span>
              {getFieldDecorator(`tag_list[${k}][name_kh]`, {
                rules: [{ required: true, message: '必填' }],
                initialValue: (tag_list_value[k] && tag_list_value[k]['name_kh']) || '',
              })(<Input style={{ width: '80%' }} placeholder="请输入名称（10字内）" />)}
            </FormItem>
          </div>
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
          {/* {index === 0 ? (
            <Icon
              className="dynamic-button"
              type="plus-circle"
              title="新增"
              onClick={addCategory}
            />
          ) : (
            <Icon
              className="dynamic-button"
              type="minus-circle-o"
              title="删除"
              onClick={() => removeCategory(k)}
            />
          )} */}
        </div>
      </FormItem>
    ));

    return (
      <div>
        <Modal
          width={460}
          destroyOnClose
          title="商品属性"
          visible={visible}
          onOk={this.onOk}
          onCancel={onCancel}
        >
          <div>
            <Button
              type="primary"
              onClick={() => {
                this.handleTagModal(true);
              }}
            >
              新增
            </Button>
          </div>
          <Radio.Group
            onChange={this.onChange}
            value={showTagVal}
            style={{ width: '100%', height: 225, overflowY: 'auto', marginTop: 20 }}
          >
            {dishAttributeList.map(item => (
              <div className={stylesIndex.tag_item} key={item.id}>
                <div className={stylesIndex.tag_title_box}>
                  <Radio value={item.id} className={stylesIndex.tag_title}>
                    {item.name}
                  </Radio>
                  <div className={stylesIndex.tag_btn_box}>
                    <a
                      className={`${stylesIndex.anticon} ${stylesIndex.anticon_edit}`}
                      onClick={() => this.handleTagModal(true, item.id)}
                    >
                      编辑
                    </a>
                    <a
                      className={`${stylesIndex.anticon} ${stylesIndex.anticon_close}`}
                      onClick={() => this.removeTagModal(item.id)}
                    >
                      删除
                    </a>
                  </div>
                </div>
                <div className={stylesIndex.tag_desc}>
                  <span>{item.tag_list}</span>
                </div>
              </div>
            ))}
          </Radio.Group>
        </Modal>
        {/* 商品属性 -- 新增/编辑 */}
        <Modal
          width={640}
          destroyOnClose
          title={
            editFormValues && Object.keys(editFormValues).length ? '编辑商品属性' : '新增商品属性'
          }
          visible={this.state.dishAttributeModal}
          onOk={this.saveDishAttribute}
          onCancel={() => {
            this.handleTagModal(false);
          }}
          bodyStyle={{ padding: 0 }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                this.handleTagModal(false);
              }}
            >
              取消
            </Button>,
            <Button key="save" type="primary" onClick={this.saveDishAttribute}>
              存为模板
            </Button>,
            <Button key="submit" type="primary" onClick={this.saveToCommodity}>
              保存
            </Button>,
          ]}
        >
          <div style={{ maxHeight: 500, overflowY: 'auto', padding: 24 }}>
            <FormItem {...formLayout} label="属性名称" required>
              <div className="form-col-box">
                <FormItem>
                  <span>中文：</span>
                  {getFieldDecorator('name_cn', {
                    rules: [{ required: true, message: '必填' }],
                    initialValue: (editFormValues && editFormValues.name_cn) || '',
                  })(
                    <Input
                      style={{ width: '80%' }}
                      placeholder="请输入名称（10字内）"
                      maxLength={10}
                    />
                  )}
                  <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                    <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
                  </span>
                </FormItem>
                <FormItem>
                  <span>英文：</span>
                  {getFieldDecorator('name_en', {
                    rules: [{ required: true, message: '必填' }],
                    initialValue: (editFormValues && editFormValues.name_en) || '',
                  })(<Input style={{ width: '80%' }} placeholder="请输入名称（10字内）" />)}
                </FormItem>
                <FormItem>
                  <span>柬文：</span>
                  {getFieldDecorator('name_kh', {
                    rules: [{ required: true, message: '必填' }],
                    initialValue: (editFormValues && editFormValues.name_kh) || '',
                  })(<Input style={{ width: '80%' }} placeholder="请输入名称（10字内）" />)}
                </FormItem>
              </div>
            </FormItem>
            <FormItem {...formLayout} label="属性选项" required>
              {formItems}
            </FormItem>
          </div>
        </Modal>
      </div>
    );
  }
}

export default DishAttribute;
