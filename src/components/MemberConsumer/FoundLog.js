import React, { Component, Fragment } from 'react';
import moment from 'moment';
import Link from 'umi/link';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, AutoComplete, Radio, Badge, Tabs, Table } from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'error', 'success'];
const status = ['所有', '审核中', '拒绝', '审核通过'];

class FoundLog extends Component {
  state = {
    formValues: {},
  };

  columns = [
    {
      title: '类型',
      dataIndex: 'type',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      sorter: true,
    },
    {
      title: '类型',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      sorter: true,
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <Link to={'/order/service/details/' + record.id}>查看</Link>
        </Fragment>
      ),
    },
  ];

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

    this.props.getList(params);
    window.scrollTo(0, 0);
  };

  render() {
    const { loading, dataSource } = this.props;
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

export default FoundLog;
