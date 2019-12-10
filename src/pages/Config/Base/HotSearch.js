import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, Alert, message } from 'antd';
import utils from '@/utils/utils';
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
const formLayout_more = {
  labelCol: { span: 3 },
  wrapperCol: { span: 8 },
};
const formLayout_two = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 6, offset: 3 },
  },
};

@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      wordsList: props.wordsList,
    };
    console.log(this.props);
  }

  addHotWords = () => {
    const value = this.props.form.getFieldValue('value_cn');
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
    const { getFieldDecorator, getFieldValue } = form;
    const { wordsList } = this.state;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        console.log('handleAdd fieldsValue', fieldsValue);
        handleAdd(fieldsValue);
      });
    };

    return (
      <div>
        <FormItem {...formLayout_more} label="热门搜索">
          <div className="form-col-box">
            <FormItem {...formLayout_two} label="中文">
              {getFieldDecorator('value_cn', {
                rules: [{ required: true, message: '必填' }],
              })(<Input placeholder="请输入" autoComplete="off" />)}
              <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                <a onClick={() => { utils.translator(form, 'value') }}>翻译</a>
              </span>

            </FormItem>
            <FormItem {...formLayout_two} label="英文">
              {getFieldDecorator('value_en', {
                rules: [{ required: true, message: '必填' }],
              })(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
            <FormItem {...formLayout_two} label="柬文">
              {getFieldDecorator('value_kh', {
                rules: [{ required: true, message: '必填' }],
              })(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
            <div className="dynamic-button" style={{ right: '-80px' }}>
              <Button type="primary" onClick={this.addHotWords}>添加</Button>
            </div>
          </div>
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



@connect(({ hotSearch, loading }) => ({
  hotSearch,
  loading: loading.effects['hotSearch/fetchHotSearchInfo'],
}))
@Form.create()
class HotSearch extends PureComponent {
  state = {
    infoData: [],
    wordsList: []
  };

  componentDidMount () {
    this.getInfo()
  }

  getInfo = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'hotSearch/fetchHotSearchInfo',
      payload: null,
      callback: res => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items
        this.setState({
          infoData: data[0],
          wordsList: data[0].value
        }, () => {
          // console.log('123', this.state.infoData);
        })
      },
    });
  }

  saveForm = (fields) => {
    const { dispatch } = this.props;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'hotSearch/fetchEditHotSearch',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
      },
    });

  }

  render () {
    const { infoData, wordsList } = this.state;

    return (
      <Fragment>
        <h3 className={styles.editTitle}>热门搜索</h3>
        {infoData && Object.keys(infoData).length ? (<CreateForm handleAdd={this.saveForm} wordsList={wordsList} />) : null}

      </Fragment>
    );
  }
}

export default HotSearch;