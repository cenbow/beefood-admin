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
import { getMenu } from '../../../utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['', 'default', 'warning', 'processing', 'success', 'error'];
const status = ['', '已接单 未到店', '已到店 未取货', '已取货配送中', '已完成', '订单取消'];

@connect(({ deliverymanOrderList, common, loading }) => ({
  deliverymanOrderList,
  common,
  loading: loading.models.deliverymanOrderList,
}))
@Form.create()
class DeliverymanOrderList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '下单日期',
      dataIndex: 'order_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '运单编号',
      dataIndex: 'deliver_no',
    },
    {
      title: '区域',
      render: record => (
        <span>
          {record.user_province}
          {record.user_city}
          {record.user_region}
        </span>
      ),
    },
    {
      title: '配送员',
      render: record => (
        <div>
          {record.driver_name}
          <p>13800138000</p>
        </div>
      ),
    },
    {
      title: '配送距离',
      dataIndex: 'delivery_distance',
    },
    {
      title: '配送费',
      dataIndex: 'delivery_income',
    },
    {
      title: '类型',
      dataIndex: 'deliver_type',
      sorter: true,
    },
    {
      title: '时间状态',
      dataIndex: 'delivering_num',
    },
    {
      title: '异常报备',
      dataIndex: 'receipt_num',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
        {
          text: status[3],
          value: 3,
        },
        {
          text: status[4],
          value: 4,
        },
        {
          text: status[5],
          value: 5,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('view') != -1 ? (
            <Link to={'/delivery/order/details/' + record.deliver_no}>详情</Link>
          ) : (
            ''
          )}
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliverymanOrderList/fetchDeliverymanOrderList',
      payload: {
        page: 1,
        pagesize: 10,
      },
    });
    this.fetchMenu();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        this.setState({
          menu: getMenu(res.data.items, 'delivery', 'order'),
        });
      },
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

    dispatch({
      type: 'deliverymanOrderList/fetchDeliverymanOrderList',
      payload: params,
    });
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'deliverymanOrderList/fetchDeliverymanOrderList',
      payload: {},
    });
  };

  onChangeCascader = (value, selectedOptions) => {
    console.log(value, selectedOptions);
  };

  filterCascader = (inputValue, path) => {
    return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'deliverymanOrderList/fetchDeliverymanOrderList',
        payload: values,
      });
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const options = [
      {
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [
              {
                value: 'xihu',
                label: 'West Lake',
              },
              {
                value: 'xiasha',
                label: 'Xia Sha',
                disabled: true,
              },
            ],
          },
        ],
      },
      {
        value: 'jiangsu',
        label: 'Jiangsu',
        children: [
          {
            value: 'nanjing',
            label: 'Nanjing',
            children: [
              {
                value: 'zhonghuamen',
                label: 'Zhong Hua men',
              },
            ],
          },
        ],
      },
    ];

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="注册时间">
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
          <Col md={6} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('realname_status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">待认证</Option>
                  <Option value="2">已通过认证</Option>
                  <Option value="3">认证失败</Option>
                  <Option value="4">已停用</Option>
                  <Option value="5">认证中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="姓名">
              {getFieldDecorator('keyword')(<Input placeholder="姓名/手机号码" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="工作状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">休息中</Option>
                  <Option value="2">开工</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="类型">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">普通配送员</Option>
                  <Option value="2">平台配送员</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="评分">
              {getFieldDecorator('score')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="4">4</Option>
                  <Option value="5">5</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="区域">
              {getFieldDecorator('region_id')(
                <Cascader
                  options={options}
                  onChange={this.onChangeCascader}
                  placeholder="请选择"
                  showSearch={this.filterCascader}
                />
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
      deliverymanOrderList: { data },
      loading,
    } = this.props;
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={data}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default DeliverymanOrderList;
