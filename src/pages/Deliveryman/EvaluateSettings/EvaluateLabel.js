import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router, { routerRedux } from 'umi/router';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Upload } from 'antd';
import StandardTable from '@/components/StandardTable';
import PrefixSelector from '@/components/PrefixSelector/index';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, { getMenu, whatSex, getBase64, beforeUpload } from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const type = { 1: '满意', 2: '不满意' };

// 新增
@Form.create()
class CreateForm extends PureComponent {
  state = {

  };

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;
    const { getFieldDecorator } = form;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleAdd(fieldsValue);
      });
    };

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    return (
      <Modal
        width={640}
        destroyOnClose
        title="添加标签"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <Form>
          <FormItem key="type" {...formLayout} label="标签类型">
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '请选择标签类型！' }],
              initialValue: '1',
            })(
              <Radio.Group>
                {
                  Object.keys(type).map(i => (
                    <Radio value={i} key={i}>{type[i]}</Radio>
                  ))
                }
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="中文标签内容">
            {getFieldDecorator('content_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入内容，最多10个字" maxLength={10} />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'content') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文标签内容">
            {getFieldDecorator('content_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文标签内容">
            {getFieldDecorator('content_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {
    },
    handleUpdateModalVisible: () => {
    },
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
    };
  }

  okHandle = () => {
    const { form, handleUpdate } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleUpdate(fieldsValue);
    });
  };

  renderContent = formVals => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    return (
      <Form>
        <FormItem key="type" {...formLayout} label="标签类型">
          {getFieldDecorator('type', {
            rules: [{ required: true, message: '请选择标签类型！' }],
            initialValue: `${formVals.type}`,
          })(
            <Radio.Group>
              {
                Object.keys(type).map(i => (
                  <Radio value={i} key={i}>{type[i]}</Radio>
                ))
              }
            </Radio.Group>
          )}
        </FormItem>
        <FormItem {...formLayout} label="中文标签内容">
          {getFieldDecorator('content_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.content_cn,
          })(<Input placeholder="请输入内容，最多10个字" maxLength={10} />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'content') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文标签内容">
          {getFieldDecorator('content_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.content_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文标签内容">
          {getFieldDecorator('content_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.content_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
      </Form>
    );
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="编辑"
        visible={updateModalVisible}
        onOk={this.okHandle}
        onCancel={() => handleUpdateModalVisible(false)}
        afterClose={() => handleUpdateModalVisible()}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

@connect(({ deliverymanComment, loading, common }) => ({
  deliverymanComment,
  common,
  loading: loading.effects['deliverymanComment/fetchEvaluateLabelList'],
}))
@Form.create()
class EvaluateLabel extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '标签类型',
      width: 400,
      dataIndex: 'type',
      render: val => <span>{type[val]}</span>,
    },
    {
      title: '评价标签',
      width: 400,
      dataIndex: 'content',
    },
    {
      title: '操作',
      width: 300,
      render: (text, record) => (
        <Fragment>
          <span>
            <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
          </span>
          <span>
            <Divider type="vertical" />
            <a onClick={() => this.handleDelete(record)}>删除</a>
          </span>
        </Fragment>
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
            menu: getMenu(res.data.items, 'deliveryman', null),
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
    dispatch({
      type: 'deliverymanComment/fetchEvaluateLabelList',
      payload: getParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

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

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['create_time'];
      const lastTimeValue = fieldsValue['last_login_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(rangeTimeValue),
        last_login_time: utils.getDateTimeMap(lastTimeValue)
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    const { dispatch } = this.props;
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    dispatch({
      type: 'deliverymanComment/fetchEvaluateLabelInfo',
      payload: {
        id: record.id,
      },
      callback: res => {
        this.setState({
          editFormValues: res.data.items
        });

      },
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'deliverymanComment/fetchEvaluateLabelAdd',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
        this.handleModalVisible();
      },
    });
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const { editFormValues } = this.state;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    formData.append('id', editFormValues.id);

    dispatch({
      type: 'deliverymanComment/fetchEvaluateLabelEdit',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
        this.handleUpdateModalVisible();
      },
    });
  };

  handleDelete = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', fields.id);
    confirm({
      title: '温馨提示',
      content: '确认是否删除改标签？',
      onOk: () => {
        dispatch({
          type: 'deliverymanComment/fetchEvaluateLabelDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  };

  //筛选
  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="标签类型">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" allowClear>
                  {
                    Object.keys(type).map(i => (
                      <Option value={i} key={i}>{type[i]}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
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
      deliverymanComment: { evaluateLabelList = {} },
      loading,
    } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title"><Button type="default" shape="circle" icon="left" onClick={() => router.goBack()} style={{ marginRight: '5px' }} />标签设置</span>
            <div className="fr button_group">
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                添加标签
              </Button>
            </div>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={evaluateLabelList}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {
          modalVisible && (<CreateForm {...parentMethods} modalVisible={modalVisible} />)
        }
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
          />
        ) : null}
      </div>
    );
  }
}

export default EvaluateLabel;
