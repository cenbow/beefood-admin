import React, { PureComponent, Fragment, useState } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Upload, Cascader } from 'antd';
import StandardTable from '@/components/StandardTable';
import WangEditor from '@/components/WangEditor';
import styles from '@/assets/css/TableList.less';
import ShowImg from '@/components/showImg';
import configVar from '@/utils/configVar';
import utils, { getMenu } from '@/utils/utils';
// import WangEditor from "@/components/WangEditor";
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const statusMap = { 1: 'default', 2: 'success' };
const status = { 1: '已下线', 2: '已上线' };

// 推送新消息
const CreateForm = Form.create()(props => {
  const { form, handleSubmitMessage, menu } = props;
  const { getFieldDecorator } = form;
  const [content, setContent] = useState('');
  const okHandle = (e) => {
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleSubmitMessage(fieldsValue, form);
    });
  };

  // const onChangeVal = html => {
  //   setContent(html);
  // };

  const onValidator = (_, value, callback) => {
    if (value && value.isEmpty()) {
      callback('请输入正文内容')
    } else {
      callback()
    }
  }

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

  const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 13 },
  };

  const submitFormLayout = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 10, offset: 3 },
    },
  };

  return (
    <Card type="inner" title={<span><Icon type="message" /> 骑手消息推送</span>}>
      <Form onSubmit={okHandle}>
        <FormItem {...formLayout} label="中文标题">
          {getFieldDecorator('title_cn', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'title') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文标题">
          {getFieldDecorator('title_en', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文标题">
          {getFieldDecorator('title_kh', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>

        <FormItem {...formItemLayout} label="中文内容" style={{ height: 360 }}>
          {getFieldDecorator('content_cn', {
            validateTrigger: 'onBlur',
            rules: [{
              required: true,
              message: '必填',
            }],
          })(
            <BraftEditor
              className="my-editor"
              // controls={controls}
              placeholder="请输入正文内容"
            />
          )}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-930px', bottom: '145px' }}>
            <a onClick={() => { utils.translator(form, 'content') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formItemLayout} label="英文内容" style={{ height: 360 }}>
          {getFieldDecorator('content_en', {
            validateTrigger: 'onBlur',
            rules: [{
              required: true,
              message: '必填',
            }],
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
            rules: [{
              required: true,
              message: '必填',
            }],
          })(
            <BraftEditor
              className="my-editor"
              // controls={controls}
              placeholder="请输入正文内容"
            />
          )}
        </FormItem>

        {/* <FormItem {...formLayout} label="中文内容">
        {getFieldDecorator('content_cn', {
          rules: [{ required: true, message: '必填' }],
        })(<Input.TextArea rows={4} placeholder="请输入" />)}
        <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
          <a onClick={() => { utils.translator(form, 'content') }}>翻译</a>
        </span>
      </FormItem>
      <FormItem {...formLayout} label="英文内容">
        {getFieldDecorator('content_en', {
          rules: [{ required: true, message: '必填' }],
        })(<Input.TextArea rows={4} placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="柬文内容">
        {getFieldDecorator('content_kh', {
          rules: [{ required: true, message: '必填' }],
        })(<Input.TextArea rows={4} placeholder="请输入" />)}
      </FormItem> */}

        <FormItem {...formLayout} label="推送类型">
          {getFieldDecorator('type', {
            rules: [{ required: true }],
            initialValue: '1',
          })(
            <Select allowClear>
              <Option value="1">指定人</Option>
              <Option value="2">所有人</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          {...submitFormLayout}
          style={{ marginTop: 32 }}
          extra="温馨提示：选中状态仅作用于当前列表"
        >
          {menu.indexOf('confirmPush') != -1 ? (
            <Button type="primary" htmlType="submit" icon="save">
              <FormattedMessage id="form.message.submit" />
            </Button>
          ) : (
              ''
            )}
          {menu.indexOf('historyPush') != -1 ? (
            <Link style={{ marginLeft: 8 }} to="/message/deliveryman/history">
              <Button icon="menu">
                <FormattedMessage id="form.message.history" />
              </Button>
            </Link>
          ) : (
              ''
            )}
        </FormItem>
      </Form>
    </Card>
  );
});

@connect(({ messageDriverList, common, loading }) => ({
  messageDriverList,
  common,
  loading: loading.models.messageDriverList,
}))
@Form.create()
class MessageList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '头像',
      dataIndex: 'd_driver_info',
      render: val => (<ShowImg src={val && val.avatar} className="avatar-48" />),
    },
    {
      title: '姓名',
      dataIndex: 'd_driver_info.real_name',
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
    },
    {
      title: '状态',
      render: (text, record) => (
        <div>
          <Badge status={statusMap[record.status]} text={status[record.status]} />
        </div>
      ),
    },
  ];

  componentDidMount() {
    this.getList();
    this.fetchMenu();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'message', 'deliveryman'),
          });
        }
      },
    });
  };

  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...params,
    };
    this.setState({
      selectedRows: [],
    })
    dispatch({
      type: 'messageDriverList/fetchDriverList',
      payload: getParams,
    });
  };

  //发起推送消息
  handleSubmitMessage = (fields, form) => {
    const { dispatch } = this.props;
    //console.log(fields);
    let formData = new FormData();
    formData.append('title_cn', fields.title_cn);
    formData.append('title_en', fields.title_en);
    formData.append('title_kh', fields.title_kh);

    formData.append('content_cn', fields.content_cn.toHTML());
    formData.append('content_en', fields.content_en.toHTML());
    formData.append('content_kh', fields.content_kh.toHTML());

    formData.append('type', fields.type);
    if (fields.type == 1) {
      //为个人
      const { selectedRows } = this.state;
      if (selectedRows.length == 0) {
        message.success('请选择骑手');
        return;
      }
      let user_ids_list = [];
      selectedRows.forEach(el => {
        user_ids_list.push(el.id);
      });
      formData.append('user_ids_list', user_ids_list.join(','));
    }
    dispatch({
      type: 'messageDriverList/fetchMessageDriverSend',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('推送成功');
        form.resetFields();
        form.setFieldsValue({
          'content_cn': BraftEditor.createEditorState(''),
          'content_en': BraftEditor.createEditorState(''),
          'content_kh': BraftEditor.createEditorState(''),
        })
        this.getList();
      },
    });
  };

  handleStandardTableChange = (pagination) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
    };

    this.getList(params);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <div className="page_head">
          <span className="page_head_title">骑手列表</span>
        </div>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
        <Col md={5} sm={24}>
            <FormItem label="姓名">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="手机号">
              {getFieldDecorator('mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" allowClear>
                  {
                    Object.keys(status).map(key => (
                      <Option value={key} key={key}>{status[key]}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      messageDriverList: { data },
      loading,
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { selectedRows } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <CreateForm handleSubmitMessage={this.handleSubmitMessage} menu={this.state.menu} />
        </Card>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default MessageList;
