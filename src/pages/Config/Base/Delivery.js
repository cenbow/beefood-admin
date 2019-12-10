import React, { PureComponent, Fragment, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Tabs, Table, Modal, message, Upload, Radio, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import { getBase64, beforeUpload } from '@/utils/utils';

import styles from '@/assets/css/TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const statusMap = ['default', 'success', 'error'];
const status = ['所有', '启用', '禁用'];

// 列表
@connect(({ configDelivery, common, loading }) => ({
  configDelivery,
  common,
  loading: loading.models.configDelivery,
}))
@Form.create()
class Delivery extends PureComponent {
  state = {
    page: configVar.page,
    pagesize: configVar.pagesize,
    citys: [],
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.getCommon();
    this.getList();
  }

  getCommon = () => {
    const { dispatch } = this.props;
    // 选择国家
    dispatch({
      type: 'common/getCountry',
      payload: {},
    });
  };

  // 国家城市联动
  selectCountry = id => {
    const { form, dispatch } = this.props;
    form.setFieldsValue({
      'city_id': undefined,
    });
    if (!id) {
      dispatch({
        type: 'common/getCity',
        payload: 'clear',
      });
    } else {
      dispatch({
        type: 'common/getCity',
        payload: {
          country_id: id,
        },
      });
    }
  };

  getList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params
    }
    dispatch({
      type: 'configDelivery/fetchCityDeliveryList',
      payload: getParams
    });
  }

  columns = [
    {
      title: '国家',
      render: (text, record) => (
        <span>{record.sys_country && record.sys_country.name}</span>
      ),
    },
    {
      title: '城市',
      render: (text, record) => (
        <span>{record.sys_city && record.sys_city.name}</span>
      ),
    },
    {
      title: '基础配送费',
      dataIndex: 'basic_delivery_price',
      render: val => (
        <span>${val/100}</span>
      ),
    },
    {
      title: '距离附加费',
      render: (text, record) => {
        return (record.distance_append_price || []).map((item, i) => (
          <div key={i}>{item.end_distance == 0 ? item.start_distance + '以上公里' : item.start_distance + '-' + item.end_distance +'公里'}，每公里加${item.price / 100}；</div>
          // <div key={i}>{item.start_distance}-{item.end_distance == 0 ? '以上' : item.end_distance}公里，每公里加${item.price / 100}；</div>
        ))
      },
    },
    {
      title: '操作',
      width: 160,
      render: (text, record) => (
        <Fragment>
          <Link to={'/config/base/delivery/edit/' + record.id}>编辑</Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = (pagination) => {
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

  handleDelete = fields => {
    const { dispatch } = this.props;
    confirm({
      title: '删除配送',
      content: '确定删除此配送？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'configDelivery/deleteCityDelivery',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  }

  renderSimpleForm() {
    const {
      common: {
        country = [],
        city = [],
      },
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="国家">
              {getFieldDecorator('country_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} onChange={this.selectCountry}>
                  {country.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="城市">
              {getFieldDecorator('city_id')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {city.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
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
    const {
      configDelivery: { list },
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
            <span className="page_head_title">配送设置</span>
            <span className="fr">
              <Link to="/config/base/delivery/edit"><Button icon="plus" type="primary">新增配送</Button></Link>
            </span>
          </div>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={list}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Fragment>
    );
  }
}

export default Delivery;