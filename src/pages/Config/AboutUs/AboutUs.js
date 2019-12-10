import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Row, Col, Icon, message, Card } from 'antd';
import { getBase64, beforeUpload } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
// import WangEditor from "@/components/WangEditor";
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor';
import utils from '@/utils/utils';

import styles from '../Config.less';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ config, loading }) => ({
  config,
  loading: loading.models.config,
}))
@Form.create()
class AboutUs extends PureComponent {
  state = {
    page_id: '',
  };

  componentDidMount() {
    const { form, dispatch } = this.props;
    dispatch({
      type: 'config/fetchPage',
      payload: {
        type: 1
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        this.setState({
          page_id: data.id,
        });
        form.setFieldsValue({
          'content_cn': BraftEditor.createEditorState(data.content_cn),
          'content_en': BraftEditor.createEditorState(data.content_en),
          'content_kh': BraftEditor.createEditorState(data.content_kh),
        })
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

  onValidator = (_, value, callback) => {
    if (value && value.isEmpty()) {
      callback('请输入正文内容')
    } else {
      callback()
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // 获取编辑器中的内容
      let formData = new FormData();
      formData.append('id', this.state.page_id);
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
    });
  }

  render() {
    const {
      form,
      loading
    } = this.props;
    const { getFieldDecorator } = form;

    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 },
    };

    const submitFormLayout = {
      wrapperCol: { span: 12, offset: 3 },
    };

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">关于我们</span>
        </div>
        <div style={{height: 1220}}>
          <Form onSubmit={this.handleSubmit}>
            {/* <FormItem {...formItemLayout} label="中文内容">
                <WangEditor onChangeVal={this.onChangeVal} defaultValue={getPage.content_cn} />
              </FormItem> */}
            <FormItem {...formItemLayout} label="中文内容" style={{height: 360}}>
              {getFieldDecorator('content_cn', {
                validateTrigger: 'onBlur',
                rules: [{ required: true, validator: this.onValidator }],
              })(
                <BraftEditor
                  className="my-editor"
                  // controls={controls}
                  placeholder="请输入正文内容"
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="英文内容" style={{ height: 360 }}>
              {getFieldDecorator('content_en', {
                validateTrigger: 'onBlur',
                rules: [{ required: true, validator: this.onValidator }],
              })(
                <BraftEditor
                  className="my-editor"
                  // controls={controls}
                  placeholder="请输入正文内容"
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="柬文内容" style={{ height: 360 }}>
              {getFieldDecorator('content_kh', {
                validateTrigger: 'onBlur',
                rules: [{ required: true, validator: this.onValidator }],
              })(
                <BraftEditor
                  className="my-editor"
                  // controls={controls}
                  placeholder="请输入正文内容"
                />
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                <FormattedMessage id="form.save" />
              </Button>
            </FormItem>
          </Form>
        </div>
      </Card>
    );
  }
}

export default AboutUs;