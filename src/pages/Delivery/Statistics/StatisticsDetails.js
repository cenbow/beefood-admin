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

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

@connect(({ deliverymanStatisticsList, loading }) => ({
  deliverymanStatisticsList,
  loading: loading.models.deliverymanStatisticsList,
}))
@Form.create()
class StatisticsDetails extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  columns = [
    {
      title: '接单日期',
      dataIndex: 'driver_name',
    },
    {
      title: '运单编号',
      dataIndex: 'driver_phone',
    },
    {
      title: '区域',
      dataIndex: 'income',
    },
    {
      title: '配送员',
      dataIndex: 'delivery_distances',
    },
    {
      title: '配送距离',
      dataIndex: 'deliverying_nums',
    },
    {
      title: '配送费',
      dataIndex: 'delivery_nums',
    },
    {
      title: '类型',
      dataIndex: 'finish_delivery_num',
    },
    {
      title: '时间状态',
      dataIndex: 'finish_overtime_delivery_num',
    },
    {
      title: '异常报备',
      dataIndex: 'deliver_anomaly',
    },
    {
      title: '状态',
      dataIndex: 'status',
    },
  ];

  componentDidMount() {
    this.getStatisticsList();
  }

  getStatisticsList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliverymanStatisticsList/fetchStatisticsDetails',
      payload: params,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    this.getStatisticsList(params);
    window.scrollTo(0, 0);
  };

  render() {
    const {
      deliverymanStatisticsList: { statisticsDetails },
      loading,
    } = this.props;
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={statisticsDetails}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default StatisticsDetails;
