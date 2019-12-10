import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Button, Row, Col, Card, Tree, message } from 'antd';
import { getBase64, beforeUpload } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
const { TreeNode } = Tree;
const FormItem = Form.Item;
@connect(({ list, adminSetting, loading }) => ({
  list,
  adminSetting,
  loading: loading.models.list,
}))
@Form.create()
class RoleAuthority extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      confirmLoading: false,
    };
    for (var i = 0; i < 100; i++) {
      this.state['checkedKeys' + [i]] = '';
    }
  }
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { params } = match;

    dispatch({
      type: 'adminSetting/fetchRolePermissions',
      payload: {
        role_id: params.id,
      },
      callback: res => {
        if (res.code == 200) {
          var bb = [];
          for (var mm = 0; mm < res.data.items.length; mm++) {
            if (res.data.items[mm].children.length == 0) {
              if (res.data.items[mm].status == 1) {
                bb.push(res.data.items[mm].id.toString());
              }
            }
            for (var nn = 0; nn < res.data.items[mm].children.length; nn++) {
              if (res.data.items[mm].children[nn].children.length == 0) {
                if (res.data.items[mm].children[nn].status == 1) {
                  bb.push(res.data.items[mm].children[nn].id.toString());
                }
              }
              for (var j = 0; j < res.data.items[mm].children[nn].children.length; j++) {
                if (res.data.items[mm].children[nn].children[j].status === 1) {
                  bb.push(res.data.items[mm].children[nn].children[j].id.toString());
                }
              }
            }
          }
        }
        this.setState({
          checkedKeys: bb,
        });
      },
    });
  }
  handleSubmit = e => {
    e.preventDefault();
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
    const { form, dispatch, match } = this.props;
    const { params } = match;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      var formsurfaceData = new FormData();
      formsurfaceData.append('role_id', params.id);
      for (var i = 0; i < aa.length; i++) {
        formsurfaceData.append('permissions[]', aa[i]);
      }
      // 提交数据
      dispatch({
        type: 'adminSetting/fetchRoleAuthorise',
        payload: formsurfaceData,
        callback: res => {
          if (res.code == 200) {
            message.success('保存成功', 0.5, () => {
              this.props.history.push(`/setting/role`);
            });
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
    const { formValues } = this.state;
    const {
      list: { list },
      adminSetting: { permission },
      form: { getFieldDecorator },
      loading,
    } = this.props;
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
        <h3 className="edit_title">权限设置</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="权限">
            <Card
              bodyStyle={{ paddingTop: 8 }}
              style={{
                width: 1080,
                height: ' 600px',
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

export default RoleAuthority;
