import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Modal, Form, Checkbox, Button, Input, message, } from 'antd';
import stylesIndex from './index.less';
import utils from '@/utils/utils';

const FormItem = Form.Item;

@connect(({ mdish, loading }) => ({
  mdish,
  loading: loading.models.mdish,
}))
@Form.create()
class DishTag extends Component {

  state = {
    dishTagModal: false,
    editFormValues: {},
    showTagVal: [],
  }

  componentDidMount() {
    const { values } = this.props;
    this.getTagList();
    this.setState({
      showTagVal: values,
    });
  }

  getTagList = () => {
    const { dispatch, merchant_id } = this.props;
    dispatch({
      type: 'mdish/getDishTagList',
      payload: {
        merchant_id: merchant_id
      },
    });
  }

  handleTagModal = (flag, id) => {
    const { dispatch } = this.props;
    this.setState({
      dishTagModal: !!flag,
      editFormValues: {},
    });
    if (!id) return;
    // 获取编辑信息
    dispatch({
      type: 'mdish/fetchDishTagInfo',
      payload: { id: id },
      callback: res => {
        if (!utils.successReturn(res)) return;
        this.setState({
          editFormValues: res.data.items,
        });
      },
    });
  };

  onChange = (checkedValues) => {
    // console.log('checked = ', checkedValues);
    this.setState({
      showTagVal: checkedValues,
    })
  }

  // 添加编辑
  saveDishTag = () => {
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
      if (editFormValues.id) {
        formData.append('id', editFormValues.id);
        dispatch({
          type: 'mdish/fetchEditDishTag',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('保存成功');
            this.getTagList();
            this.handleTagModal(false);
          },
        });
      }else{
        dispatch({
          type: 'mdish/fetchSaveDishTag',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('添加成功');
            this.getTagList();
            this.handleTagModal(false);
          },
        });
      }
    });
  }

  // 删除
  removeTagModal = (id) => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: '删除标签',
      content: '确定删除此标签？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', id);
        dispatch({
          type: 'mdish/fetchDishTagDelete',
          payload: formData,
          callback: (res) => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getTagList();
          }
        });
      },
    });
  }

  onOk = () => {
    const { mdish: { dishTagList = [] }} = this.props;
    const { showTagVal } = this.state;
    if (showTagVal.length == 0) return message.info("请选择商品标签");
    let tag_name = '';
    showTagVal.forEach((val,i) => {
      dishTagList.forEach(el => {
        if (val == el.id) {
          if (i == showTagVal.length-1) {
            tag_name += el.name;
          } else {
            tag_name += el.name + '/';
          }
        }
      });
    });
    let data = {
      'value': showTagVal,
      'name': tag_name,
    };
    this.props.onOk(data);
    this.props.onCancel();
  }

  render() {
    const { mdish: { dishTagList = [] }, form, visible, onCancel } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { editFormValues, showTagVal} = this.state;

    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <div>
        <Modal
          width={460}
          destroyOnClose
          title="商品标签"
          visible={visible}
          onOk={this.onOk}
          onCancel={onCancel}
        >
          <div>
            <Button type="primary" onClick={() => { this.handleTagModal(true) }}>新增</Button>
          </div>
          <Checkbox.Group onChange={this.onChange} value={showTagVal} style={{width: '100%',height: 223, overflowY: 'auto',marginTop: 20}}>
            {
              dishTagList.map((item) => (
                <div className={stylesIndex.tag_item} key={item.id}>
                  <div className={stylesIndex.tag_title_box}>
                    <Checkbox value={item.id} className={stylesIndex.tag_title}>{item.name}</Checkbox>
                    <div className={stylesIndex.tag_btn_box}>
                      <a className={`${stylesIndex.anticon} ${stylesIndex.anticon_edit}`} onClick={() => this.handleTagModal(true, item.id)}>编辑</a>
                      <a className={`${stylesIndex.anticon} ${stylesIndex.anticon_close}`} onClick={() => this.removeTagModal(item.id)}>删除</a>
                    </div>
                  </div>
                  <div className={stylesIndex.tag_desc}><span>{item.desc}</span></div>
                </div>
              ))
            }
          </Checkbox.Group>
        </Modal>
        {/* 商品标签 -- 新增/编辑 */}
        <Modal
          width={640}
          destroyOnClose
          title={editFormValues && Object.keys(editFormValues).length ? "编辑商品标签" : "新增商品标签" }
          visible={this.state.dishTagModal}
          onOk={this.saveDishTag}
          onCancel={() => { this.handleTagModal(false) }}
        >
          <FormItem {...formLayout} label="标签名称" required>
            <div className="form-col-box">
              <FormItem>
                <span>中文：</span>
                {getFieldDecorator('name_cn', {
                  rules: [{ required: true, message: '必填' }],
                  initialValue: editFormValues && editFormValues.name_cn || '',
                })(<Input style={{ width: '80%', }} placeholder="请输入名称（20字内）" maxLength={20} />)}
                <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                  <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
                </span>
              </FormItem>
              <FormItem>
                <span>英文：</span>
                {getFieldDecorator('name_en', {
                  rules: [{ required: true, message: '必填' }],
                  initialValue: editFormValues && editFormValues.name_en || '',
                })(<Input style={{ width: '80%', }} placeholder="请输入名称（20字内）" maxLength={20} />)}
              </FormItem>
              <FormItem>
                <span>柬文：</span>
                {getFieldDecorator('name_kh', {
                  rules: [{ required: true, message: '必填' }],
                  initialValue: editFormValues && editFormValues.name_kh || '',
                })(<Input style={{ width: '80%', }} placeholder="请输入名称（20字内）" maxLength={20} />)}
              </FormItem>
            </div>
          </FormItem>
          <FormItem {...formLayout} label="标签描述">
            {getFieldDecorator('desc', {
              rules: [{ required: true, message: '必填' }],
              initialValue: editFormValues && editFormValues.desc || '',
            })(<Input.TextArea placeholder="请输入标签描述（100字内）" rows={4} maxLength={100} />)}
          </FormItem>
        </Modal>
      </div>
    )
  }
}

export default DishTag;