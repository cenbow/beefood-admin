import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Row, Col, Tabs, Icon, Card, message } from 'antd';
import { getLocaleLang } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
// import WangEditor from "@/components/WangEditor";
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor';
import utils from '@/utils/utils';
import styles from './Official.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TabPane } = Tabs;
const tab_type = {
  1: '公司介绍', 2: '公司愿景', 3: '公司使命', 4: '价值观', 5: '联系我们',
}

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 12 },
};

const submitFormLayout = {
  wrapperCol: { span: 12, offset: 3 },
};

// 更新内容
@Form.create()
class UpdateForm extends PureComponent {

  componentDidMount() {
    const { form, values } = this.props;
    // console.log(this.props.values);
    form.setFieldsValue({
      'content_cn': BraftEditor.createEditorState(values.content_cn),
      'content_en': BraftEditor.createEditorState(values.content_en),
      'content_kh': BraftEditor.createEditorState(values.content_kh),
    })
  }

  render() {
    const { form, handleSubmit, values, loading } = this.props;
    const okHandle = (e) => {
      e.preventDefault();
      form.validateFields((err, fieldsValue) => {
        console.log(fieldsValue);
        
        if (err) return;
        // form.resetFields();
        handleSubmit(fieldsValue);
      });
    };

    const onValidator = (_, value, callback) => {
      if (value && value.isEmpty()) {
        callback('请输入正文内容')
      } else {
        callback()
      }
    }

    return (
      <Form onSubmit={okHandle}>
        <FormItem {...formItemLayout} label="中文内容" style={{ height: 360 }}>
          {form.getFieldDecorator('content_cn', {
            validateTrigger: 'onBlur',
            rules: [{ required: true, validator: onValidator }],
          })(
            <BraftEditor
              className="my-editor"
              placeholder="请输入正文内容"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="英文内容" style={{ height: 360 }}>
          {form.getFieldDecorator('content_en', {
            validateTrigger: 'onBlur',
            rules: [{ required: true, validator: onValidator }],
          })(
            <BraftEditor
              className="my-editor"
              placeholder="请输入正文内容"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="柬文内容" style={{ height: 360 }}>
          {form.getFieldDecorator('content_kh', {
            validateTrigger: 'onBlur',
            rules: [{ required: true, validator: onValidator }],
          })(
            <BraftEditor
              className="my-editor"
              placeholder="请输入正文内容"
            />
          )}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={loading} className="fr">
            <FormattedMessage id="form.save" />
          </Button>
          <Button className="fr m-r-10">
            清空
          </Button>
        </FormItem>
      </Form>
    );
  };
}

@connect(({ config, loading }) => ({
  config,
  loading: loading.models.config,
}))
@Form.create()
class Explain extends PureComponent {
  state = {
    tabKey: 3,
    formValues:{},
  };

  componentDidMount() {
    //默认第一个
    this.getPageInfo(this.state.tabKey);
  }

  getPageInfo = (tabKey) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'official/fetchPage',
      payload: {
        type: tabKey
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        this.setState({
          formValues: res.data.items
        });
      }
    });
  }

  // onChangeVal = html => {
  //   this.setState({
  //     page: {
  //       ...this.state.page,
  //       content_cn: html
  //     },
  //   })
  // }

  handleSubmit = (fieldsValue) => {
    const { dispatch } = this.props;
    const { tabKey } = this.state;
    let formData = new FormData();
    formData.append('id', tabKey);
    formData.append('content_cn', fieldsValue.content_cn.toHTML());
    formData.append('content_en', fieldsValue.content_en.toHTML());
    formData.append('content_kh', fieldsValue.content_kh.toHTML());
    dispatch({
      type: 'config/fetchPageEdit',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success("保存成功");
      }
    });
  }

  callback = key => {
    this.setState({
      tabKey: key,
      formValues: '',
    }, () => {
      this.getPageInfo(this.state.tabKey);
    })
  }

  render() {
    const { form, loading } = this.props;
    const { formValues } = this.state;
    
    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">规则说明</span>
        </div>
        <Tabs type="card" onChange={this.callback}>
          {Object.keys(tab_type).map((i) => (
            <TabPane tab={tab_type[i]} key={i}>
              {formValues && Object.keys(formValues).length ? (
                <UpdateForm
                  handleSubmit={this.handleSubmit}
                  values={formValues}
                  loading={loading}
                />
              ) : null}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    );
  }
}

export default Explain;