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
    DatePicker,
    message,
    Modal,
    Badge,
    Divider,
    Switch,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
import utils from '@/utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const getValue = obj =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');
const statusMap = ['default', 'success', 'error'];
const status = ['所有', '正常', '禁止'];

@connect(({ adminSetting, common, loading }) => ({
    adminSetting,
    common,
    loading: loading.effects['adminSetting/fetchManagerList'],
}))
@Form.create()
class SettingUserList extends PureComponent {
    state = {
        formValues: {},
        menu: [],
    };

    componentDidMount () {
        this.getRole();
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
                        menu: getMenu(res.data.items, 'setting', 'user'),
                    });
                }
            },
        });
    };
    //是否屏蔽
    onChange = (checked, item) => {
        console.log(checked, item);
        var value;
        if (checked == false) {
            value = 2;
        } else {
            value = 1;
        }
        this.shelf(value, item.id);
    };
    //屏蔽
    shelf = (value, ids) => {
        console.log(value, ids);
        const { dispatch } = this.props;
        var recommendData = new FormData();
        recommendData.append('admin_id', ids);
        recommendData.append('status', value);
        dispatch({
            type: 'adminSetting/fetchManagerStatus',
            payload: recommendData,
            callback: res => {
                if (res.code == 200) {
                    message.success('修改成功', 0.1, () => {
                        this.getList();
                    });
                } else {
                    message.error(res.msg);
                }
            },
        });
    };
    getRole = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'adminSetting/fetchRoleList',
        });
    };

    getList = params => {
        const { dispatch } = this.props;
        let getParams = {
            page: 1,
            pagesize: 25,
            ...params,
        };
        // 获取订单列表
        dispatch({
            type: 'adminSetting/fetchManagerList',
            payload: getParams,
        });
    };

    handleStandardTableChange = (pagination, filtersArg, sorter) => {
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

    handleDelete = fields => {
        console.log(fields);
        confirm({
            title: '温馨提示',
            content: '确认是否删除？',
            onOk: () => {
                const { dispatch } = this.props;
                let formData = new FormData();
                formData.append('admin_id', fields.id);
                // 获取列表
                dispatch({
                    type: 'adminSetting/fetchManagerDelete',
                    payload: formData,
                    callback: res => {
                        if (!utils.successReturn(res)) return;
                        message.success('删除成功');
                        this.getList();
                    },
                });
            },
            onCancel () {
                console.log('Cancel');
            },
        });
    };

    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        this.getList();
    };

    handleSearch = e => {
        e.preventDefault();

        const { form } = this.props;

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

    renderSimpleForm () {
        const {
            form: { getFieldDecorator },
            adminSetting: { roleList },
        } = this.props;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
                    <Col lg={4} md={8} sm={24}>
                        <FormItem label="用户名">
                            {getFieldDecorator('userName')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                    <Col lg={4} md={8} sm={24}>
                        <FormItem label="用户状态" style={{ width: '100%' }}>
                            {getFieldDecorator('userStatus')(
                                <Select placeholder="请选择" allowClear={true}>
                                    <Option value={1}>正常</Option>
                                    <Option value={2}>禁止</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col xl={4} md={8} sm={24}>
                        <span className={styles.submitButtons}>
                            <Button type="primary" htmlType="submit">
                                查询
              </Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                                重置
              </Button>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }

    render () {
        const {
            adminSetting: { managerList },
            loading,
        } = this.props;
        //是否屏蔽按钮
        const AlbumStatus = props => (
            <Fragment>
                {this.state.menu.indexOf('banned') != -1 ? (
                    <Switch
                        size="small"
                        onChange={e => this.onChange(e, props.current)}
                        checked={props.current.status == 1 ? true : false}
                    />
                ) : (
                        <Switch
                            size="small"
                            disabled
                            onChange={e => this.onChange(e, props.current)}
                            checked={props.current.status == 1 ? true : false}
                        />
                    )}
            </Fragment>
        );
        const columns = [
            {
                title: '姓名',
                width: 180,
                dataIndex: 'realName',
            },
            {
                title: '用户名',
                width: 180,
                dataIndex: 'userName',
            },
            // {
            //   title: '手机号码',
            //   width: 180,
            //   dataIndex: 'title',
            // },
            {
                title: '角色',
                width: 180,
                dataIndex: 'roles',
                render: val => (
                    <span className={styles.group}>
                        {val.map(item => {
                            return (
                                <span key={item.id}>
                                    {item.name}
                                    <i>|</i>
                                </span>
                            );
                        })}
                    </span>
                ),
            },
            {
                title: '添加时间',
                width: 180,
                dataIndex: 'create_time',
                render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
            },
            {
                title: '状态',
                width: 120,
                dataIndex: 'status',
                render (val) {
                    return <Badge status={statusMap[val]} text={status[val]} />;
                },
            },
            {
                title: '生效',
                width: 120,
                render: item => <AlbumStatus current={item} />,
            },
            {
                title: '操作',
                width: 120,
                render: (text, record) => (
                    <Fragment>
                        {this.state.menu.indexOf('edit') != -1 ? (
                            <Link
                                to={{
                                    pathname: `/setting/user/edit/${record.id}`,
                                    query: {
                                        realName: record.realName,
                                        roles: JSON.stringify(record.roles),
                                        userName: record.userName,
                                    },
                                }}
                            >
                                编辑
              </Link>
                        ) : (
                                ''
                            )}
                        {this.state.menu.indexOf('delete') != -1 ? (
                            <Fragment>
                                <Divider type="vertical" />
                                <a onClick={() => this.handleDelete(record)}>删除</a>
                            </Fragment>
                        ) : (
                                ''
                            )}
                    </Fragment>
                ),
            },
        ];
        return (
            <div>
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
                        <div className={styles.tableListOperator}>
                            {this.state.menu.indexOf('add') != -1 ? (
                                <Link to="/setting/user/create">
                                    <Button icon="plus" type="primary">
                                        新增
                  </Button>
                                </Link>
                            ) : (
                                    ''
                                )}
                        </div>
                        <StandardTable
                            rowKey={list => list.id}
                            selectedRows={[]}
                            rowSelection={null}
                            loading={loading}
                            data={managerList}
                            columns={columns}
                            onChange={this.handleStandardTableChange}
                        />
                    </div>
                </Card>
            </div>
        );
    }
}

export default SettingUserList;
