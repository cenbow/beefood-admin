import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Upload, Cascader } from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import ShowImg from '@/components/showImg';
import utils, { getMenu } from '@/utils/utils';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const type = { 1: '重要提醒', 2: '订单消息', 3: '售后消息', 4: '系统消息' }
const business_type = { 1: '营业中', 2: '暂停营业', 3: '筹建中', 4: '已关闭' };
const statusMap = { 0: 'default', 1: 'processing', 2: 'success', 3: 'error' };
const verify_status = { 0: '未认证', 1: '认证中', 2: '已通过', 3: '未通过' };

// 查看
@Form.create()
class SeeModal extends PureComponent {
    static defaultProps = {
        getSysMessageUser: () => { },
        handleSeeModalVisible: () => { },
        values: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            formValues: {}
        };

        this.formLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 13 },
        };
    }

    columns = [
        {
            title: 'LOGO',
            dataIndex: 'logo',
            render: val => (<ShowImg src={val} className="avatar-48" />),
        },
        {
            title: '店铺名称',
            width:260,
            dataIndex: 'name',
        },
        {
            title: '手机号码',
            dataIndex: 'mobile',
        },
        {
            title: '认证状态',
            render: (text, record) => (
                <div>
                    <Badge
                        status={
                            statusMap[
                            record.verify_status ? record.verify_status : 0
                            ]
                        }
                        text={
                            verify_status[
                            record.verify_status ? record.verify_status : 0
                            ]
                        }
                    />
                </div>
            ),
        },
        {
            title: '营业状态',
            dataIndex: 'business_type',
            render: val => (business_type[val]),
        },
    ];

    componentDidMount() {
        this.getSysMessageUser();
    }

    getSysMessageUser = (getParams) => {
        const { values, getSysMessageUser } = this.props;
        const params = {
            id: values.id,
            ...getParams
        };
        getSysMessageUser(params);
    }

    handleSeeStandardTableChange = (pagination) => {
        const { formValues } = this.state;

        const params = {
            page: pagination.current,
            pagesize: pagination.pageSize,
            ...formValues,
        };

        this.getSysMessageUser(params);
    };

    handleSeeSearch = e => {
        e.preventDefault();
        const { form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const params = {
                ...fieldsValue
            };
            this.getSysMessageUser(params);
        });
    };

    handleSeeFormReset = () => {
        const { form } = this.props;
        form.resetFields();
        this.getSysMessageUser();
    }

    renderSeeSimpleForm() {
        const {
            form: { getFieldDecorator },
        } = this.props;

        return (
            <Form onSubmit={this.handleSeeSearch} layout="inline">
                <Row gutter={{ md: 10, lg: 24, xl: 48 }}>
                    <Col md={10} sm={24}>
                        <FormItem label="店铺名称">
                            {getFieldDecorator('name')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                    <Col md={10} sm={24}>
                        <FormItem label="手机号">
                            {getFieldDecorator('mobile')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={{ md: 10, lg: 24, xl: 48 }}>
                    <Col md={8} sm={24}>
                        <FormItem label="认证状态">
                            {getFieldDecorator('verify_status')(
                                <Select placeholder="请选择" style={{ width: '100%' }}>
                                    {
                                        Object.keys(verify_status).map(key => (
                                            <Option value={key} key={key}>{verify_status[key]}</Option>
                                        ))
                                    }
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="营业状态">
                            {getFieldDecorator('business_type')(
                                <Select placeholder="请选择" style={{ width: '100%' }}>
                                    {
                                        Object.keys(business_type).map(key => (
                                            <Option value={key} key={key}>{business_type[key]}</Option>
                                        ))
                                    }
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <span className={styles.submitButtons}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleSeeFormReset}>重置</Button>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }

    render() {
        const { modalVisible, handleSeeModalVisible, values, historyDetailsData, loading } = this.props;

        return (
            <Modal
                width={800}
                bodyStyle={{height:700,overflowY:'auto'}}
                destroyOnClose
                title={`推送详情-${moment(values.create_time * 1000).format('YYYY-MM-DD')}`}
                visible={modalVisible}
                onCancel={() => handleSeeModalVisible(false)}
                footer={null}
            >
                <div className={styles.tableList}>
                    <div className={styles.tableListForm}>{this.renderSeeSimpleForm()}</div>
                    <StandardTable
                        rowKey={list => list.id}
                        selectedRows={[]}
                        rowSelection={null}
                        loading={loading}
                        data={historyDetailsData}
                        columns={this.columns}
                        onChange={this.handleSeeStandardTableChange}
                    />
                </div>
            </Modal>
        );
    }
}

@connect(({ messageMerchantList, loading }) => ({
    messageMerchantList,
    loading: loading.models.messageMerchantList,
}))
@Form.create()
class HistoryList extends PureComponent {
    state = {
        formValues: {},
        modalVisible: false,
        seeModalValues: {},
    };

    columns = [
        {
            title: '推送类型',
            dataIndex: 'type',
            width: 100,
            render: val => <span>{type[val]}</span>,
        },
        {
            title: '标题',
            width: 200,
            dataIndex: 'title',
        },
        {
            title: '消息内容',
            width: 400,
            dataIndex: 'content',
        },
        {
            title: '推送时间',
            width: 150,
            dataIndex: 'create_time',
            render: val => <span>{utils.deteFormat(val)}</span>,
        },
        {
            title: '推送对象',
            width: 100,
            render: (text, record) => (
                <div>
                    {record.send_amount == '*' ? ('推送所有人') : ("推送" + record.send_amount + "人")}
                </div>
            )
        },
        {
            title: '操作',
            width: 100,
            render: (text, record) => (
                <Fragment>
                    <Button icon="eye" onClick={() => this.handleSeeModalVisible(true, record)}>查看</Button>
                </Fragment>
            ),
        },
    ];

    componentDidMount() {
        this.getHistoryList()
    }

    getHistoryList = (params) => {
        const { dispatch } = this.props;
        let getParams = {
            page: configVar.page,
            pagesize: configVar.pagesize,
            ...params
        }
        dispatch({
            type: 'messageMerchantList/fetchHistoryMessageList',
            payload: getParams
        });
    }

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

        this.getHistoryList(params);
        window.scrollTo(0, 0);
    };

    handleFormReset = () => {
        const { form, dispatch } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        this.getHistoryList();
    };

    onChangeCascader = (value, selectedOptions) => {
        console.log(value, selectedOptions);
    }

    filterCascader = (inputValue, path) => {
        return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    }

    handleSearch = e => {
        e.preventDefault();
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const send_time = fieldsValue['send_time'];
            const values = {
                ...fieldsValue,
                send_time: utils.getDateTimeMap(send_time),
            };
            this.setState({
                formValues: values,
            });
            this.getHistoryList(values);
        });
    };

    renderSimpleForm() {
        const {
            form: { getFieldDecorator },
        } = this.props;

        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
                    <Col md={4} sm={24}>
                        <FormItem label="推送类型">
                            {getFieldDecorator('type')(
                                <Select placeholder="请选择">
                                    {Object.keys(type).map(i => (
                                        <Option value={i} key={i}>{type[i]}</Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={5} sm={24}>
                        <FormItem label="标题">
                            {getFieldDecorator('title')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                    <Col md={6} sm={24}>
                        <FormItem label="推送时间">
                            {getFieldDecorator('send_time')(
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
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }

    handleSeeModalVisible = (flag, record) => {
        this.setState({
            modalVisible: !!flag,
            seeModalValues: record || {},
        });
    };

    getSysMessageUser = params => {
        // console.log(record);
        const { dispatch } = this.props;
        let getParams = {
            page: 1,
            pagesize: 25,
            ...params
        }
        dispatch({
            type: 'messageMerchantList/fetchHistoryDetailsList',
            payload: getParams
        });
    };

    render() {
        const {
            messageMerchantList: { historyData, historyDetailsData },
            loading,
        } = this.props;
        const { modalVisible, seeModalValues } = this.state;

        return (
            <div>
                <Card bordered={false}>
                    <div className="page_head">
                        <span className="page_head_title"><Button type="default" shape="circle" icon="left" onClick={() => router.goBack()} /> 推送历史</span>
                    </div>
                    <div className={styles.tableList}>
                        <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
                        <StandardTable
                            rowKey={list => list.id}
                            selectedRows={[]}
                            rowSelection={null}
                            loading={loading}
                            data={historyData}
                            columns={this.columns}
                            onChange={this.handleStandardTableChange}
                        />
                    </div>
                </Card>
                {
                    seeModalValues && Object.keys(seeModalValues).length ? (
                        <SeeModal
                            handleSeeModalVisible={this.handleSeeModalVisible}
                            getSysMessageUser={this.getSysMessageUser}
                            modalVisible={modalVisible}
                            values={seeModalValues}
                            historyDetailsData={historyDetailsData}
                            loading={loading}
                        />
                    ) : null
                }
            </div>
        );
    }
}

export default HistoryList;
