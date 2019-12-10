import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, Spin, DatePicker, Popconfirm, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from '@/assets/css/TableList.less';
import confingVar from '@/utils/configVar';
import utils from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;

const is_pleased = { 1: '满意', 2: '不满意' };

@connect(({ deliverymanComment, common, loading }) => ({
    deliverymanComment,
    common,
    loading: loading.models.deliverymanComment,
}))
@Form.create()
class DriverPlatformComment extends Component {
    state = {
        page: confingVar.page,
        pagesize: confingVar.pagesize,
        modalVisible: false,
        formValues: {},
        editFormValues: {},
    };

    componentDidMount() {
        this.getList();
        this.getDriverEvaluateLabel();
    }

    getList = params => {
        const { dispatch } = this.props;

        let getParams = {
            page: this.state.page,
            pagesize: this.state.pagesize,
            delivery_method: 1,
            ...params,
        };

        dispatch({
            type: 'deliverymanComment/fetchDriverComment',
            payload: getParams,
        });
    };

    //获取评价标签数据
    getDriverEvaluateLabel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'common/fetchDriverEvaluateLabel',
            payload: null,
        });
    };

    columns = [
        {
            title: '骑手ID',
            width: 150,
            dataIndex: 'driver_id',
        },
        {
            title: '骑手名称',
            width: 200,
            dataIndex: 'd_driver_info.nickname',
        },
        {
            title: '评价结果',
            width: 150,
            dataIndex: 'is_pleased',
            render: val => <span>{is_pleased[val]}</span>,
        },
        {
            title: '评价标签',
            width: 300,
            dataIndex: 'label',
        },
        {
            title: '评价内容',
            width: 400,
            dataIndex: 'content',
        },
        {
            title: '评价时间',
            width: 200,
            dataIndex: 'create_time',
            render(val) {
                return <span>{utils.deteFormat(val)}</span>;
            },
        }
    ];

    handleStandardTableChange = pagination => {
        const { formValues } = this.state;
        const tablePage = {
            page: pagination.current,
            pagesize: pagination.pageSize,
        };
        const values = {
            ...tablePage,
            ...formValues,
        }
        this.setState({
            ...tablePage
        })
        this.getList(values);
        window.scrollTo(0, 0);
    };

    handleFormReset = () => {
        const { form, dispatch } = this.props;
        form.resetFields();
        this.getList();
    };

    handleSearch = e => {
        e.preventDefault();
        const { dispatch, form } = this.props;
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

    renderSimpleForm() {
        const {
            form: { getFieldDecorator },
            common,
        } = this.props;
        const { driverEvaluateLabel = [] } = common;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={4} sm={24}>
                        <FormItem label="骑手名称">
                            {getFieldDecorator('driver_name')(<Input placeholder="" />)}
                        </FormItem>
                    </Col>
                    <Col xl={4} md={8} sm={24}>
                        <FormItem label="评价结果">
                            {getFieldDecorator('is_pleased')(
                                <Select placeholder="请选择" allowClear>
                                    {Object.keys(is_pleased).map((i) => {
                                        return (
                                            <Option value={i} key={i}>
                                                {is_pleased[i]}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={4} sm={24}>
                        <FormItem label="评价标签">
                            {getFieldDecorator('content')(
                                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                                    {driverEvaluateLabel &&
                                        driverEvaluateLabel.length > 0 &&
                                        driverEvaluateLabel.map((item, index) => {
                                            return (
                                                <Option value={item.content} key={item.id}>
                                                    {item.content}
                                                </Option>
                                            );
                                        })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={6} sm={24}>
                        <FormItem label="评价时间">
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
                    <Col xl={4} md={8} sm={24}>
                        <span className={styles.submitButtons}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }

    render() {
        const { loading, deliverymanComment: { driverCommentList = {} } } = this.props;

        return (
            <GridContent>
                <div className={styles.tableList}>
                    <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
                    <StandardTable
                        rowKey={list => list.id}
                        selectedRows={[]}
                        rowSelection={null}
                        loading={loading}
                        data={driverCommentList}
                        columns={this.columns}
                        onChange={this.handleStandardTableChange}
                    />
                </div>
            </GridContent>
        );
    }
}

export default DriverPlatformComment;
