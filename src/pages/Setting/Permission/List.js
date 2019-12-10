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
  Icon,
  Button,
  message,
  Modal,
  Badge,
  Divider,
  Table,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
import utils from '@/utils/utils';

const FormItem = Form.Item;
const { confirm } = Modal;
@connect(({ adminSetting, common, loading }) => ({
  adminSetting,
  common,
  loading: loading.effects['adminSetting/fetchPermissionList'],
}))
@Form.create()
class SettingPermissionList extends PureComponent {
  state = {
    formValues: {},
    menu: [],
  };
  //更多
  MoreBtn = props => (
    <Fragment>
      <Button
        type="primary"
        style={{ marginRight: '20px' }}
        size="small"
        onClick={e => this.showAdd(e, props.current)}
      >
        {<FormattedMessage id="system.Add.the.next.layer" />}
      </Button>
    </Fragment>
  );
  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'Option2',
      render: name => <span>{<FormattedMessage id={name} />}</span>,
    },
    {
      title: '组件',
      dataIndex: 'component',
    },
    {
      title: '路由',
      dataIndex: 'path',
    },
    {
      title: '是否菜单',
      dataIndex: 'isMenu',
      width: 100,
      key: 'Option1',
      render: isMenu => (
        <span>
          {isMenu == 1 ? '是' : ''}
          {isMenu == 0 ? '否' : ''}
        </span>
      ),
    },
    {
      title: '操作',
      width: 180,
      render: (text, record) => (
        <Fragment>
          {record.isMenu != 0 && this.state.menu.indexOf('newSubmenu') != -1 ? (
            <span>
              <Link to={`/setting/permission/create?cid=${record.id}&&parentId=${record.parentId}`}>
                新建子菜单
              </Link>
              <Divider type="vertical" />
            </span>
          ) : (
            ''
          )}
          {this.state.menu.indexOf('edit') != -1 ? (
            <Link
              to={`/setting/permission/edit/${record.id}?name=${record.name}&&component=${record.component}&&path=${record.path}&&isMenu=${record.isMenu}
            &&cid=${record.parentId}&&url=${record.url}&&flag=${record.flag}&&icon=${record.icon}`}
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

  componentDidMount() {
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
            menu: getMenu(res.data.items, 'setting', 'permission'),
          });
        }
      },
    });
  };
  // 获取列表
  getList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adminSetting/fetchPermissionList',
    });
  };
  handleDelete = fields => {
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        const { dispatch } = this.props;
        let formData = new FormData();
        formData.append('id', fields.id);
        // 获取列表
        dispatch({
          type: 'adminSetting/fetchPermissionDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  render() {
    const {
      adminSetting: { permission },
      loading,
    } = this.props;
    console.log(permission);
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              {this.state.menu.indexOf('add') != -1 ? (
                <Link to={`/setting/permission/create?cid=0&&parentId=0`}>
                  <Button icon="plus" type="primary">
                    新增
                  </Button>
                </Link>
              ) : (
                ''
              )}
            </div>
            <Table
              bordered={true}
              pagination={{ pageSize: 25 }}
              rowKey={(result, index) => result.id}
              columns={this.columns}
              dataSource={permission}
              size="small"
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default SettingPermissionList;
