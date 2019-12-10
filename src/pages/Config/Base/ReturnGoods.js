import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, Alert } from 'antd';

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

// 邀请好友
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      wordsList: ["包装不好", "骑手态度不好"],
    };

  }

  addHotWords = () => {
    const value = this.props.form.getFieldValue('value');
    this.state.wordsList.push(value);
    this.setState({
      wordsList: [...this.state.wordsList],
    })

  }

  handleClose = (index) => {
    this.setState({
      wordsList: this.state.wordsList.filter((_, i) => i !== index)
    })
  };

  render () {
    const { form, handleAdd } = this.props;
    const { wordsList } = this.state;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleAdd(fieldsValue);
      });
    };

    return (
      <div>
        <FormItem {...formLayout} label="申请售后时间">
          {form.getFieldDecorator('time', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" addonAfter="分钟" />)}
        </FormItem>
        <FormItem {...formLayout} label="售后原因配置">
          {form.getFieldDecorator('value', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={this.addHotWords}>添加</a>
          </span>
        </FormItem>
        <FormItem {...submitFormLayout}>
          {
            wordsList.length > 0 && (
              <span>
                <h3><span style={{ fontSize: 14, color: '#999' }}>已添加</span></h3>
                {
                  wordsList.map((item, index) => (
                    <span key={index} style={{ marginBottom: 8, display: 'block' }}>
                      <div className="ant-alert ant-alert-warning ant-alert-no-icon ant-alert-closable">
                        <span className="ant-alert-message">{item}</span>
                        <a className="ant-alert-close-icon"><Icon type="close" onClick={() => this.handleClose(index)} /></a>
                      </div>
                    </span>
                  ))
                }
              </span>
            )
          }
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" onClick={okHandle}>
            <FormattedMessage id="form.save" />
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
            <FormattedMessage id="form.cancel" />
          </Button>
        </FormItem>
      </div>
    );
  }
};



@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
@Form.create()
class ReturnGoods extends PureComponent {
  state = {
  };

  saveForm = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      console.log(values);
      // this.getUserList(values);
    });
  }

  render () {
    const { imageUrl, background_color } = this.state;
    const {
      list: { list },
      form: { getFieldDecorator },
      loading
    } = this.props;

    return (
      <Fragment>
        <h3 className={styles.editTitle}>售后设置(需求原型图已没有此设置功能)</h3>
        <CreateForm handleAdd={this.saveForm} />
      </Fragment>
    );
  }
}

export default ReturnGoods;