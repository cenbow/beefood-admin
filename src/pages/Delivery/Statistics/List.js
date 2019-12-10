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

@connect(({ deliverymanStatisticsList, common, loading }) => ({
  deliverymanStatisticsList,
  common,
  loading: loading.models.deliverymanStatisticsList,
}))
@Form.create()
class List extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '配送员',
      dataIndex: 'driver_name',
    },
    {
      title: '电话',
      width: 120,
      dataIndex: 'driver_phone',
    },
    {
      title: '收益',
      width: 120,
      dataIndex: 'income',
      sorter: true,
    },
    {
      title: '总距离',
      width: 120,
      dataIndex: 'delivery_distances',
      sorter: true,
    },
    {
      title: '配送中',
      width: 120,
      dataIndex: 'deliverying_nums',
      sorter: true,
    },
    {
      title: '接单',
      width: 120,
      dataIndex: 'delivery_nums',
      sorter: true,
    },
    {
      title: '完成',
      width: 120,
      dataIndex: 'finish_delivery_num',
      sorter: true,
    },
    {
      title: '完成超时',
      width: 120,
      dataIndex: 'finish_overtime_delivery_num',
      sorter: true,
    },
    {
      title: '操作',
      width: 120,
      render: (text, record) => (
        <Fragment>
          <Link to={'/delivery/statistics/details/' + record.id}>详情</Link>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    this.getStatisticsList();
    this.fetchMenu();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        this.setState({
          menu: getMenu(res.data.items, 'delivery', 'statistics'),
        });
      },
    });
  };
  getStatisticsList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliverymanStatisticsList/fetchStatisticsList',
      payload: params,
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

    this.getStatisticsList(params);
    window.scrollTo(0, 0);
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
        start_statistics_time:
          fieldsValue.statistics_time && fieldsValue.statistics_time[0].format('YYYY-MM-DD'),
        end_statistics_time:
          fieldsValue.statistics_time && fieldsValue.statistics_time[1].format('YYYY-MM-DD'),
      };

      this.setState({
        formValues: values,
      });

      this.getStatisticsList(values);
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
            <FormItem label="接单时间">
              {getFieldDecorator('statistics_time')(
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
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      deliverymanStatisticsList: { statisticsListData },
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
              data={statisticsListData}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default List;
