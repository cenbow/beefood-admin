import React, { Component, Fragment } from 'react';
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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const statusMap = { '1': 'processing', '2': 'success', "3": 'error' };
const verify_status = { '1':'审批中','2':'已通过',"3":'未通过' };
const auth_verify_status = { '1': '审核中', '2': '已通过', "3":'不通过' };

class MerchantAuditList extends Component {
  state = {
    formValues: {},
  };

  columns = [
    {
      title: '商家ID',
      dataIndex: 'merchant_id',
    },
    {
      title: '商家名称',
      dataIndex: 'm_user_info.name',
    },
    {
      title: '商家品类',
      width: 260,
      render: (text, record) => (
        (record.category||[]).map((item, i) => {
          if (i != 0) {
            return (
              <span key={i}>，{item.category_one_name}>{item.category_two_name}>{item.category_three_name}</span>
            );
          }
          return (
            <span key={i}>{item.category_one_name}>{item.category_two_name}>{item.category_three_name}</span>
          );
        })
      ),
    },
    {
      title: '所属区域',
      dataIndex: 'm_user_info.region',
    },
    {
      title: '所属商圈',
      dataIndex: 'm_user_info.business',
    },
    {
      title: '提交人',
      dataIndex: 'admin_info.realname',
    },
    {
      title: '提交时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '审核结果',
      render: (text, record) => (
        <div>
          <div><Badge status={statusMap[record.verify_status]} text={verify_status[record.verify_status]} /></div>
          <div className="verify_status_show">
            <div><span>基本信息：</span>{auth_verify_status[record.basic_verify_status]}</div>
            <div><span>营业信息：</span>{auth_verify_status[record.shop_verify_status]}</div>
            <div><span>店铺环境：</span>{auth_verify_status[record.ambient_verify_status]}</div>
            <div><span>认证信息：</span>{auth_verify_status[record.auth_verify_status]}</div>
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <Link to={'/merchant/auditing/' + record.merchant_id}><Button>查看</Button></Link>
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = (pagination) => {
    const { formValues } = this.state;
    const params = {
        page: pagination.current,
        pagesize: pagination.pageSize,
        ...formValues,
    };

    this.props.getList(params);
    window.scrollTo(0, 0);
};

  render() {
    const { loading, dataSource } = this.props;
    return (
      <GridContent>
        <StandardTable
          rowKey={list => list.merchant_id}
          selectedRows={[]}
          rowSelection={null}
          loading={loading}
          data={dataSource}
          columns={this.columns}
          onChange={this.handleStandardTableChange}
        />
      </GridContent>
    );
  }
}

export default MerchantAuditList;
