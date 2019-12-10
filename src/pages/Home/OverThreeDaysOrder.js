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
const statusMap = ['', 'default', 'warning', 'processing', 'warning', 'success', 'warning', 'warning', 'error'];
const status = ['', '待支付', '待受理', '配送中(待核销)', '待评价', '已完成', '售后订单', '交易关闭(未支付)', '交易关闭(用户取消)'];

class OverThreeDaysOrder extends Component {
  state = {
    formValues: {},
  };

  columns = [
    {
      title: '编号',
      dataIndex: 'mumber',
    },
    {
      title: '商家名称',
      dataIndex: 'merchant_name',
    },
    {
      title: '会员名称',
      dataIndex: 'mobile',
    },
    {
      title: '配送方式',
      dataIndex: 'delivery_method',
      render: val => {
        let value = '';
        switch (val) {
          case 1:
            value = "平台";
            break;
          case 2:
            value = "商家";
            break;
          case 3:
            value = "自提";
            break;
        }
        return value;
      }
    },
    {
      title: '支付方式',
      dataIndex: 'sale_type',
      render: val => {
        let value = '';
        switch (val) {
          case 1:
            value = "wing";
            break;
          case 2:
            value = "pipay";
            break;
        }
        return value;
      }
    },
    {
      title: '订单金额',
      sorter: true,
      dataIndex: 'sale_price',
    },
    {
      title: '下单时间',
      dataIndex: 'pay_time',
      sorter: true,
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      width: 72,
      render: (text, record) => (
        <Fragment>
          <Link to={'/member/consumer/details/' + record.id}>详情</Link>
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

export default OverThreeDaysOrder;
