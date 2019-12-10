import React, {Component, Fragment} from 'react';
import moment from 'moment';
import Link from 'umi/link';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Icon,
  Menu,
  Dropdown,
  Card,
  AutoComplete,
  Radio,
  Badge,
  Tabs,
  Table,
  Divider, message, Modal
} from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
const FormItem = Form.Item;
const {confirm} = Modal;
const {Option} = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const statusMap = {1: 'success', 2: 'processing', 3: 'default'};
const status = {1: '未使用', 2: '已使用', 3: '已失效'};

@Form.create()
class BonusValue extends Component {
  state = {
    formValues: {},
  };

  columns = [
    {
      title: '红包名称',
      dataIndex: 'name',
    },
    {
      title: '面额',
      dataIndex: 'money',
    },
    {
      title: '使用金额',
      dataIndex: 'condition',
    },
    {
      title: '领取时间',
      dataIndex: 'create_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '失效时间',
      dataIndex: 'end_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]}/>;
      },
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <Link to={'/member/consumer/bonusDetails/' + record.id}>查看</Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  handleDelete = fields => {
    const {dispatch} = this.props;
    let formData = new FormData();
    formData.append('id', fields.id);
    confirm({
      title: '温馨提示',
      content: '确认是否删除此红包？',
      onOk: () => {
        dispatch({
          type: 'member/fetchBonusValueDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.props.getList();
          },
        });
      },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const {formValues} = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
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

    this.props.getList(params);
    window.scrollTo(0, 0);
  };

  render() {
    const {loading, dataSource} = this.props;
    return (
      <GridContent>
        <StandardTable
          rowKey={list => list.id}
          selectedRows={[]}
          rowSelection={null}
          loading={loading}
          data={dataSource}
          columns={this.columns}
          onChange={this.handleStandardTableChange}
        />
      </GridContent>
    )
  }
}

export default BonusValue;
