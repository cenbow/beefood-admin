import React, { PureComponent, Fragment, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Tabs, Table, Modal, message, Upload, Radio, Badge, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import utils, { getBase64, beforeUpload } from '@/utils/utils';
import ShowImg from '@/components/showImg';
import moment from 'moment';
import styles from '@/assets/css/TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const statusMap = ['', 'success', 'default'];
const status = ['', '启用', '禁用'];

// 列表
@connect(({ activity, loading }) => ({
  activity,
  loading: loading.effects['activity/fetchSubjectList'],
}))
@Form.create()
class Activity extends PureComponent {
  state = {
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '图片',
      dataIndex: 'image',
      render: url => <ShowImg className="avatar-48" src={url} />,
    },
    {
      title: '活动名称',
      dataIndex: 'name',
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '上线状态',
      dataIndex: 'status',
      render (val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Link to={`/config/base/activity/edit?editType=1&id=${record.id}`}>编辑</Link>
          <Divider type="vertical" />
          {
            record.status == 2 && (<span><a onClick={() => this.handleAbleStatus(record)}>启用</a>
              <Divider type="vertical" /></span>)
          }
          {
            record.status == 1 && (<span><a onClick={() => this.handleDisableStatus(record)}>禁用</a>
              <Divider type="vertical" /></span>)
          }
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount () {
    this.getList();
  }

  getList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params
    }
    dispatch({
      type: 'activity/fetchSubjectList',
      payload: getParams
    });
  }

  handleStandardTableChange = pagination => {
    const { formValues } = this.state;
    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
    };
    this.getList(params);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in fieldsValue) {
        if (fieldsValue.hasOwnProperty(key)) {
          const val = fieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }

      if (newFieldsValue.create_time !== undefined) {
        const startTimeArr = newFieldsValue.create_time
        const s_startTime = moment(startTimeArr[0].startOf('day')).unix()
        const s_endTime = moment(startTimeArr[1].startOf('day')).unix()
        newFieldsValue.create_time = `${s_startTime},${s_endTime}`
      }

      const values = {
        ...newFieldsValue,
      };

      this.setState({
        formValues: values,
      });

      console.log('搜索', values);

      this.getList(values);
    });
  };

  handleAbleStatus = fields => {
    console.log(fields);
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定启用此专题吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'activity/fetchEnableSubject',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('成功启用');
            this.getList();
          },
        });
      }
    });
  }

  handleDisableStatus = fields => {
    console.log(fields);
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定禁用此专题吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'activity/fetchDisableSubject',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('成功禁用');
            this.getList();
          },
        });
      }
    });
  }

  handleDelete = fields => {
    console.log(fields);
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定删除此专题吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'activity/fetchDeleteSubject',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      }
    });
  }

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="活动名称">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="添加时间">
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
          <Col md={6} sm={24}>
            <FormItem label="上线状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
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

  render () {
    const {
      activity: { data },
      loading
    } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };

    return (
      <Fragment>
        <div className={styles.tableList} style={{ paddingTop: 24 }}>
          <div className="page_head">
            <span className="page_head_title">专题设置</span>
            <span className="fr">
              <Link to={`/config/base/activity/edit?editType=0`}><Button icon="plus" type="primary">新增专题</Button></Link>
            </span>
          </div>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={data}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Fragment>
    );
  }
}

export default Activity;