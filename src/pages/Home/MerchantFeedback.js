import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import {
    Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, AutoComplete, Radio, Badge, Tabs, Table, Divider, Modal,
    message,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import utils from '@/utils/utils';
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const statusMap = { 1: 'processing', 4: 'success' };
const status = { 1: '未处理', 4: '已处理' };

// 编辑
@Form.create()
class UpdateForm extends PureComponent {
    static defaultProps = {
        handleUpdate: () => { },
        handleUpdateModalVisible: () => { },
        values: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            // formVals: {
            //     content: props.values.content,
            // },
        };
    }

    handleNext = () => {
        const { form, handleUpdate } = this.props;
        // const { formVals: oldValue } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            handleUpdate(fieldsValue);
            // const formVals = { ...oldValue, ...fieldsValue };
            // this.setState({
            //     formVals,
            // },() => {
            //     handleUpdate(formVals);
            // });
        });
    };

    renderContent = formVals => {
        const { form } = this.props;
        const formLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 13 },
        };
        return (
            <div>
                <FormItem key="reply_content" {...formLayout} label="回复内容">
                    {form.getFieldDecorator('reply_content', {
                        rules: [{ required: true, message: '请输入回复内容！' }],
                    })(<Input.TextArea rows={4} placeholder="请输入回复内容" />)}
                </FormItem>
            </div>
        );
    };

    render() {
        const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
        const { formVals } = this.state;

        return (
            <Modal
                width={640}
                bodyStyle={{ padding: '32px 40px 48px' }}
                destroyOnClose
                title="回复"
                visible={updateModalVisible}
                onOk={this.handleNext}
                onCancel={() => handleUpdateModalVisible(false, values)}
                afterClose={() => handleUpdateModalVisible()}
            >
                {this.renderContent(formVals)}
            </Modal>
        );
    }
}

@connect(({ feedback, common, loading }) => ({
    feedback,
    common,
    loading: loading.models.feedback,
}))

@Form.create()
class MerchantFeedback extends PureComponent {
    state = {
        updateModalVisible: false,
        formValues: {},
        editFormValues: {},
        menu: [],
    };

    columns = [
        {
            title: '反馈时间',
            width: 180,
            dataIndex: 'feedback_time',
            render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
            title: '商家名称',
            width: 180,
            dataIndex: 'merchant_name',
        },
        {
            title: '反馈内容',
            width: 400,
            dataIndex: 'content',
        },
        {
            title: '回复内容',
            width: 400,
            dataIndex: 'reply_content',
        },
        {
            title: '状态',
            width: 120,
            dataIndex: 'status',
            render(val) {
                return <Badge status={statusMap[val]} text={status[val]} />;
            },
        },
        {
            title: '操作',
            width: 120,
            render: (text, record) => (
                <Fragment>
                    {record.status != '4' && (
                        <>
                            <a onClick={() => this.handleUpdateModalVisible(true, record)}>回复</a>
                            <Divider type="vertical" />
                        </>
                    )}
                    <a onClick={() => this.handleDelete(record)}>删除</a>
                </Fragment>
            ),
        },
    ];

    handleUpdateModalVisible = (flag, record) => {
        this.setState({
            updateModalVisible: !!flag,
            editFormValues: record || {},
        });
    };

    handleUpdate = fields => {
        const { dispatch } = this.props;
        const { editFormValues } = this.state;

        let formData = new FormData();
        formData.append('id', editFormValues.id);
        formData.append('reply_content', fields.reply_content);

        dispatch({
            type: 'feedback/replyMerchantFeedback',
            payload: formData,
            callback: res => {
                console.log(res)
                if (!utils.successReturn(res)) return;
                message.success('回复成功');
                this.props.getList();
                this.handleUpdateModalVisible(false);
            },
        });
    };

    handleDelete = fields => {
        const { dispatch } = this.props;
        let formData = new FormData();
        formData.append('id', fields.id);
        confirm({
          title: '温馨提示',
          content: '确认是否删除？',
          onOk: () => {
            dispatch({
              type: 'feedback/removeMerchantFeedback',
              payload: formData,
              callback: res => {
                if (!utils.successReturn(res)) return;
                message.success('删除成功');
                this.props.getList();
              },
            });
          },
          onCancel() {
            // console.log('Cancel');
          },
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

        this.props.getList(params);
        window.scrollTo(0, 0);
    };

    render() {
        const { loading, dataSource } = this.props;
        const { updateModalVisible, editFormValues } = this.state;
        const updateMethods = {
            handleUpdateModalVisible: this.handleUpdateModalVisible,
            handleUpdate: this.handleUpdate,
        };
        return (
            <div>
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
                {editFormValues && Object.keys(editFormValues).length ? (
                    <UpdateForm
                        {...updateMethods}
                        updateModalVisible={updateModalVisible}
                        values={editFormValues}
                    />
                ) : null}
            </div>
        )
    }
}

export default MerchantFeedback;
