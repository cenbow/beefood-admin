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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '@/utils/utils';
import utils from '@/utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const getValue = obj =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');

@connect(({ adminSetting, common, loading }) => ({
    adminSetting,
    common,
    loading: loading.effects['adminSetting/fetchRoleList'],
}))
@Form.create()
class SettingRoleList extends PureComponent {
    state = {
        formValues: {},
        menu: [],
    };

    columns = [
        {
            title: '名称',
            width: 300,
            dataIndex: 'name',
        },
        {
            title: '描述',
            width: 300,
            dataIndex: 'label',
        },
        {
            title: '组成员',
            render: (text, record) => (
                <Fragment>
                    <span className={styles.group}>
                        {record.admins != null
                            ? record.admins.map(item => {
                                return (
                                    <span key={item.id}>
                                        {item.realName}
                                        <i>|</i>
                                    </span>
                                );
                            })
                            : ''}
                    </span>
                </Fragment>
            ),
        },
        {
            title: '操作',
            width: 180,
            render: (text, record) => (
                <Fragment>
                    {this.state.menu.indexOf('edit') != -1 ? (
                        <Link to={`/setting/role/edit/` + record.id}>编辑</Link>
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
                    {this.state.menu.indexOf('authority') != -1 ? (
                        <Fragment>
                            <Divider type="vertical" />
                            <Link to={`/setting/role/authority/` + record.id}>权限管理</Link>
                        </Fragment>
                    ) : (
                            ''
                        )}
                </Fragment>
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
                        menu: getMenu(res.data.items, 'setting', 'role'),
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
        // 获取列表
        dispatch({
            type: 'adminSetting/fetchRoleList',
            payload: getParams,
        });
    };

    handleStandardTableChange = (pagination, sorter) => {
        const params = {
            page: pagination.current,
            pagesize: pagination.pageSize,
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
                formData.append('role_id', fields.id);
                // 获取列表
                dispatch({
                    type: 'adminSetting/fetchRoleDelete',
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
    render () {
        const {
            adminSetting: { roleList },
            loading,
        } = this.props;

        return (
            <div>
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListOperator}>
                            {this.state.menu.indexOf('add') != -1 ? (
                                <Link to="/setting/role/create">
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
                            data={roleList}
                            columns={this.columns}
                            onChange={this.handleStandardTableChange}
                        />
                    </div>
                </Card>
            </div>
        );
    }
}

export default SettingRoleList;
