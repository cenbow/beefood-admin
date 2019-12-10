import React, { Component, Fragment } from 'react';
import moment from 'moment';
import Link from 'umi/link';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, AutoComplete, Radio, Badge, Tabs, Table } from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import utils from '@/utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const statusMap = { 2: 'processing', 3: 'error', 4: 'success', 5: 'error', 6: 'success' };
const status = { 2: '审核中', 3: '拒绝', 4: '审核通过', 5: '退款失败', 6: '退款成功' };
const reason = {
    1: '我不想要了/下错订单',
    2: '商家通知我卖完了',
    3: '商家沟通态度差',
    4: '骑手沟通态度差',
    5: '送太慢了，等太久了',
    6: '包装破损',
    7: '少送商品',
    8: '送错商品',
    9: '口味不佳/个人感受不好',
    10: '餐内有异物',
    11: '食用后引起身体不适',
    12: '商品变质',
    13: '用户其他',
    14: '商品已售完',
    15: '店铺太忙',
    16: '店铺已打烊',
    17: '地址无法配送',
    18: '重复订单',
    19: '商家其它',
    20: '接单超时'
};
class OrderRefundList extends Component {
    state = {
        formValues: {},
    };

    //用户取消订单列表
    columns = [
        {
            title: '售后单号',
            dataIndex: 'return_no',
        },
        {
            title: '订单号',
            dataIndex: 'order_no',
        },
        {
            title: '商家名称',
            dataIndex: 'merchant_name',
        },
        {
            title: '配送方式',
            dataIndex: 'dish_name',
        },
        {
            title: '取消原因',
            dataIndex: 'reason',
            render: val => reason[val],
        },
        {
            title: '责任方',
            dataIndex: '',
        },
        {
            title: '申请人',
            dataIndex: 'operator',
        },
        {
            title: '申请时间',
            dataIndex: 'create_time',
            render: val => <span>{utils.deteFormat(val)}</span>,
        },
        {
            title: '审核状态',
            dataIndex: 'status',
            render: val => {
                return <Badge status={statusMap[val]} text={status[val]} />;
            }
        },
        {
            title: '操作',
            width: 72,
            render: (text, record) => (
                <Fragment>
                    <Link to={'/member/consumer/details/' + record.order_no}>查看</Link>
                </Fragment>
            ),
        },
    ];

    //用户订单退款列表
    columns2 = [
        {
            title: '售后单号',
            dataIndex: 'return_no',
        },
        {
            title: '订单号',
            dataIndex: 'order_no',
        },
        {
            title: '商家名称',
            dataIndex: 'merchant_name',
        },
        {
            title: '配送方式',
            dataIndex: 'dish_name',
        },
        {
            title: '退款商品',
            dataIndex: 'dish_name_str',
            render: (text, record) => (
                <div>
                    {record.dish_name_str && (Object.values(record.dish_name_str.split(',')) || [].map((item) => (
                        <div>{item}</div>
                    )))}
                </div>
            ),
        },
        {
            title: '退款原因',
            dataIndex: 'reason',
            render: val => reason[val],
        },
        {
            title: '退款金额',
            dataIndex: 'refund_amount',
        },
        {
            title: '责任方',
            dataIndex: '',
        },
        {
            title: '退款申请人',
            dataIndex: 'operator',
        },
        {
            title: '申请时间',
            dataIndex: 'create_time',
            render: val => <span>{utils.deteFormat(val)}</span>,
        },
        {
            title: '审核状态',
            dataIndex: 'status',
            render: val => {
                return <Badge status={statusMap[val]} text={status[val]} />;
            }
        },
        {
            title: '操作',
            width: 80,
            render: (text, record) => (
                <Fragment>
                    <Link to={'/member/consumer/details/' + record.order_no}>查看</Link>
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
        const { loading, dataSource, refundType } = this.props;
        return (
            <GridContent>
                <StandardTable
                    rowKey={list => list.order_no}
                    selectedRows={[]}
                    rowSelection={null}
                    loading={loading}
                    data={dataSource}
                    columns={refundType == 2 ? this.columns : this.columns2}
                    onChange={this.handleStandardTableChange}
                />
            </GridContent>
        )
    }
}

export default OrderRefundList;
