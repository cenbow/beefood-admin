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
  Alert,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
import {
  exportRedpacket
} from '@/services/statistics';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

// 红包类型 1-按注册(默认) 2-按分享 3-按用户 4-按邀请好友'',
const status = ['注册发放', '分享发放', '按用户发放', '邀请好友'];

@connect(({ bonus, common, loading }) => ({
  bonus,
  common,
  loading: loading.effects['bonus/fetchRedpacket'],
}))
@Form.create()
class Bonus extends PureComponent {
  state = {
    formValues: {},
    menu: [],
  };

  columns = [
    {
      title: '红包类型',
      dataIndex: 'type',
      render (val) {
        return <span>{status[val]}</span>;
      },
    },
    {
      title: '发放数量',
      dataIndex: 'grant_num',
    },
    {
      title: '使用数量',
      dataIndex: 'use_num',
    },
    {
      title: '未使用数量',
      dataIndex: 'not_use_num',
    },
    {
      title: '失效数量',
      dataIndex: 'invalid_num',
    },
    {
      title: '使用总金额',
      dataIndex: 'use_money',
    },
    {
      title: '红包总金额',
      dataIndex: 'grant_money',
    },
    {
      title: '数据更新时间',
      dataIndex: 'grant_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (text, record) => (
        <Link to={'/statistics/bonus/details/' + record.type}>查看</Link>
      ),
    },
  ];

  componentDidMount () {
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
            menu: getMenu(res.data.items, 'statistics', 'bonus'),
          });
        }
      },
    });
  };
  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'bonus/fetchRedpacket',
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

      this.getList(values);
    });
  };

  handleExportForm = (e) => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in fieldsValue) {
        if (fieldsValue.hasOwnProperty(key)) {
          const val = fieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }

      const values = {
        ...newFieldsValue,
      };
      this.setState({
        formValues: values,
      });
      // console.log('values', values)
      exportRedpacket(values).then(res => {
        if (!utils.successReturn(res)) return;
      })


    });
  };


  render () {
    const { bonus: { data }, loading } = this.props;
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">红包统计</span>
            <span className="fr">
              {this.state.menu.indexOf('export') != -1 ? (
                <Button style={{ marginLeft: 30 }} type="primary" onClick={this.handleExportForm}>
                  导出
                </Button>
              ) : (
                  ''
                )}
            </span>
          </div>
          <div className={styles.tableList}>
            <div style={{ marginBottom: 12 }}>
              <Alert message="备注：此表显示的是一定时间内红包信息" showIcon={false} banner />
            </div>
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

export default Bonus;
