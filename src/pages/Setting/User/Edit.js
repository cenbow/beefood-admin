import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
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
  DatePicker,
  message,
  Tree,
} from 'antd';
import { getBase64, beforeUpload } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
const { TreeNode } = Tree;
const FormItem = Form.Item;
const { Option } = Select;

@connect(({ adminSetting, loading }) => ({
  adminSetting,
  loading: loading.models.adminSetting,
}))
@Form.create()
class RoleEdit extends PureComponent {
  state = {
    id: '',
    roles: [],
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    selectedKeys: [],
    confirmLoading: false,
    permissions: [],
  };

  componentDidMount() {
    const { dispatch, match, location } = this.props;
    const { params } = match;
    const { query } = location;
    console.log(JSON.parse(query.roles));
    var arr = [];
    console.log(JSON.parse(query.roles));
    JSON.parse(query.roles).forEach(item => {
      console.log(item);
      arr.push(item.id);
    });
    this.setState({
      roles: arr,
    });
    this.getManagerInfo();
    this.getRole();
    this.getPermissionList();
  }

  getManagerInfo = () => {
    const { dispatch, match } = this.props;
    const { params } = match;
    dispatch({
      type: 'adminSetting/fetchManagerInfo',
      payload: {
        admin_id: params.id,
      },
      callback: res => {
        if (res.code == 200) {
          console.log(res.data.items.permissions);
          if (res.data.items.permissions.length > 0) {
            this.setState({
              permissions: res.data.items.permissions,
              checkedKeys: res.data.items.permissions,
            });
          }
        }
      },
    });
  };
  getRole = () => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 1000,
    };
    dispatch({
      type: 'adminSetting/fetchRoleList',
      payload: getParams,
    });
  };
  getPermissionList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adminSetting/fetchPermissionList',
    });
  };
  //获取授权
  getResult = () => {
    var arr = [];
    arr = this.state.checkedKeys;
    var bb = [];
    for (var mm = 0; mm < this.props.adminSetting.permission.length; mm++) {
      if (this.props.adminSetting.permission[mm].children.length == 0) {
        bb.push(this.props.adminSetting.permission[mm].id);
      }
      for (var nn = 0; nn < this.props.adminSetting.permission[mm].children.length; nn++) {
        console.log(this.props.adminSetting.permission[mm].children[nn].id);
        if (this.props.adminSetting.permission[mm].children[nn].children.length == 0) {
          bb.push(this.props.adminSetting.permission[mm].children[nn].id.toString());
        }
        for (
          var k = 0;
          k < this.props.adminSetting.permission[mm].children[nn].children.length;
          k++
        ) {
          bb.push(this.props.adminSetting.permission[mm].children[nn].children[k].id.toString());
        }
      }
    }
    var aa = [];
    for (var i = 0; i < bb.length; i++) {
      for (var j = 0; j < arr.length; j++) {
        if (arr[j] == bb[i]) {
          aa.push(arr[j]);
        }
      }
    }
    console.log(aa);
    return aa;
  };
  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch, match } = this.props;
    const { params } = match;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let formData = new FormData();
      Object.keys(fieldsValue).forEach(key => {
        if (key == 'role_id') {
          fieldsValue.role_id.forEach(item => {
            formData.append('role_id[]', item);
          });
        } else {
          formData.append(key, fieldsValue[key]);
          formData.append('admin_id', params.id);
        }
        if (fieldsValue.password == undefined || fieldsValue.password == '') {
          formData.delete('password');
        }
      });
      if (this.getResult().length > 0) {
        this.getResult().forEach(item => {
          formData.append('permissions[]', item);
        });
      }
      // 提交数据
      dispatch({
        type: 'adminSetting/fetchManagerEdit',
        payload: formData,
        callback: res => {
          if (res.code == 200) {
            message.success('保存成功', 0.5, () => {
              router.goBack();
            });
          } else {
            message.error(res.msg);
          }
        },
      });
    });
  };
  onExpand = expandedKeys => {
    console.log('onExpand', expandedKeys);
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  onCheck = checkedKeys => {
    console.log('onCheck', checkedKeys);
    this.setState({ checkedKeys });
  };
  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  };
  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={<FormattedMessage id={item.name} />} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  render() {
    const {
      adminSetting: { managerDetail, roleList, permission },
      form: { getFieldDecorator },
      loading,
      location,
    } = this.props;
    const { query } = location;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 6 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 6, offset: 3 },
      },
    };

    return (
      <Fragment>
        <h3 className="edit_title">编辑管理员</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="用户名">
            {getFieldDecorator('username', {
              initialValue: query.userName,
              rules: [{ required: true, message: '请输入用户名！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="姓名">
            {getFieldDecorator('realname', {
              initialValue: query.realName,
              rules: [{ required: true, message: '请输入姓名！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="登录密码" help={'密码至少要6位'}>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '必填' }, { min: 6, message: '密码至少要6位' }],
            })(<Input.Password placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="角色">
            {getFieldDecorator('role_id', {
              initialValue: this.state.roles,
              rules: [{ required: true, message: '请输入角色！' }],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                onChange={this.handleChange}
                optionLabelProp="label"
              >
                {roleList.list.map((item, i) => (
                  <Option value={item.id} label={item.name} key={i}>
                    <span role="img" aria-label={item.name}></span>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="授权">
            <Card
              bodyStyle={{ paddingTop: 8 }}
              style={{
                width: 1080,
                height: ' 400px',
                overflowY: 'auto',
              }}
            >
              <Tree
                checkable
                multiple
                defaultExpandAll={true}
                defaultExpandParent={true}
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                onCheck={this.onCheck}
                checkedKeys={this.state.checkedKeys}
                onSelect={this.onSelect}
                selectedKeys={this.state.selectedKeys}
                className="draggable-tree"
              >
                {this.renderTreeNodes(permission)}
              </Tree>
            </Card>
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">
              <FormattedMessage id="form.save" />
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                router.goBack();
              }}
            >
              <FormattedMessage id="form.cancel" />
            </Button>
          </FormItem>
        </Form>
      </Fragment>
    );
  }
}

export default RoleEdit;
