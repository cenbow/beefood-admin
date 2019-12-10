import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Radio,
  Upload,
  Cascader,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, {getMenu} from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = {1: 'processing', 4: 'success'};
const status = {1: '未处理', 4: '已处理'};

// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      // formVals: {
      //     content: props.values.content,
      // },
    };
  }

  handleNext = () => {
    const { form, handleUpdate } = this.props;
    // const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleUpdate(fieldsValue);
      // const formVals = { ...oldValue, ...fieldsValue };
      // this.setState({
      //     formVals,
      // },() => {
      //     handleUpdate(formVals);
      // });
    });
  };

  renderContent = formVals => {
    const { form } = this.props;
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
    return (
      <div>
        <FormItem key="reply_content" {...formLayout} label="回复内容">
          {form.getFieldDecorator('reply_content', {
            rules: [{ required: true, message: '请输入回复内容！' }],
          })(<Input.TextArea rows={4} placeholder="请输入回复内容" />)}
        </FormItem>
      </div>
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
        title="回复"
        visible={updateModalVisible}
        onOk={this.handleNext}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

@connect(({ feedback, common, loading }) => ({
  feedback,
  common,
  loading: loading.models.feedback,
}))
@Form.create()
class MerchantFeedbackList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '反馈时间',
      width: 180,
      dataIndex: 'feedback_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '商家名称',
      width: 180,
      dataIndex: 'merchant_name',
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
    },
    {
      title: '回复内容',
      dataIndex: 'reply_content',
    },
    {
      title: '状态',
      width: 120,
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      width: 120,
      render: (text, record) => (
        <Fragment>
          {record.status != '4' && this.state.menu.indexOf('reply') != -1 && (
            <>
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>回复</a>
              <Divider type="vertical" />
            </>
          )}
          {this.state.menu.indexOf('delete') != -1 && (
            <a onClick={() => this.handleDelete(record)}>删除</a>
          )}
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
            menu: getMenu(res.data.items, 'feedback', 'merchant'),
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
    // 获取订单列表
    dispatch({
      type: 'feedback/fetchMerchantFeedbackList',
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
    const { form } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const {dispatch, form} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['create_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(rangeTimeValue),
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: record || {},
    });
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const { editFormValues } = this.state;
    // console.log(fields, editFormValues);
    let formData = new FormData();
    formData.append('id', editFormValues.id);
    formData.append('reply_content', fields.reply_content);

    dispatch({
      type: 'feedback/replyMerchantFeedback',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('回复成功');
        this.handleUpdateModalVisible();
        this.getList();
      },
    });
  };

  handleDelete = fields => {
    const { dispatch } = this.props;
    // console.log(fields);
    let formData = new FormData();
    formData.append('id', fields.id);
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        dispatch({
          type: 'feedback/removeMerchantFeedback',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="反馈时间">
              {getFieldDecorator('create_time')(
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={[
                    formatMessage({ id: 'form.date.placeholder.start' }),
                    formatMessage({ id: 'form.date.placeholder.end' }),
                  ]}
                />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="反馈内容">
              {getFieldDecorator('content')(<Input placeholder="" />)}
            </FormItem>
          </Col>
          {/*<Col md={4} sm={24}>*/}
            {/*<FormItem label="回复内容">*/}
              {/*{getFieldDecorator('reply_content')(<Input placeholder="" />)}*/}
            {/*</FormItem>*/}
          {/*</Col>*/}
          <Col md={4} sm={24}>
            <FormItem label="是否已处理">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(status).map((i) => (
                    <Option value={i} key={i}>
                      {status[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
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
      feedback: { merchantFeedbackList },
      loading,
    } = this.props;
    const { updateModalVisible, editFormValues } = this.state;
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <div>
        <Card bordered={false}>
        <div className="page_head">
            <span className="page_head_title">商家意见反馈</span>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={merchantFeedbackList}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
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

export default MerchantFeedbackList;
