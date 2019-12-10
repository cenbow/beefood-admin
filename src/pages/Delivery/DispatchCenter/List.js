import React, { PureComponent, Suspense, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
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
  AutoComplete,
  Radio,
  Badge,
} from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import PageLoading from '@/components/PageLoading';
import StandardTable from '@/components/StandardTable';
import { getMenu } from '../../../utils/utils';
import deliveryman from '@/assets/images/deliveryman.png';
import no_order from '@/assets/images/no_order.png';
import deliverymanimg from '@/assets/images/deliverymanimg.png';

import styles from '@/assets/css/TableList.less';
import stylesList from './List.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['success', 'error', 'default'];
const status = ['启用', '禁用', '所有'];

@connect(({ rule, common, loading }) => ({
  rule,
  common,
  loading: loading.models.rule,
}))
@Form.create()
class DispatchCenterList extends PureComponent {
  state = {
    dataSource: [],
    selectedRows: [],
    formValues: {},
    rowSelected: '',
    menu: [],
  };

  columns = [
    {
      title: () => (
        <div>
          <div>运单编号</div>
          <div>(订单号)</div>
        </div>
      ),
      width: 90,
      dataIndex: 'deliver_no',
    },
    {
      title: '配送员',
      dataIndex: 'nickname',
    },
    {
      title: '配送费',
      width: 90,
      dataIndex: 'delivery_income',
    },
    {
      title: '类型',
      width: 90,
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
      ],
      render(val) {
        return <span>{status[val]}</span>;
      },
    },
    {
      title: '时间状态',
      dataIndex: 'create_time',
      width: 120,
      sorter: true,
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      width: 72,
      render: (text, record) => (
        <Fragment>
          <Link to={'/member/consumer/details/' + record.id}>详情</Link>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/consumerFetch',
    });
    this.fetchMenu();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        this.setState({
          menu: getMenu(res.data.items, 'delivery', 'dispatchCenter'),
        });
      },
    });
  };
  componentWillUnmount() {
    cancelAnimationFrame(this.reqRef);
  }

  handleSearchMap = value => {
    this.setState({
      dataSource: !value ? [] : [value, value + value, value + value + value],
    });
  };

  onSelectMap = value => {
    console.log('onSelectMap', value);
  };

  handleTabChange = e => {
    this.setState({ size: e.target.value });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem>{getFieldDecorator('deliver_no')(<Input placeholder="运单编号" />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem>{getFieldDecorator('nickname')(<Input placeholder="配送员" />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem>
              {getFieldDecorator('status')(
                <Select placeholder="类型" style={{ width: 132 }}>
                  <Option value="0">所有</Option>
                  <Option value="1">商城</Option>
                  <Option value="2">配送</Option>
                  <Option value="3">跑腿</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
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

    dispatch({
      type: 'rule/consumerFetch',
      payload: params,
    });
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'rule/consumerFetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
    console.log(rows);
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

      dispatch({
        type: 'rule/consumerFetch',
        payload: values,
      });
    });
  };

  // 选择行
  onSelectedRows = record => {
    return {
      onClick: () => {
        this.setState({
          rowSelected: record.id != this.state.rowSelected ? record.id : '',
        });
      },
    };
  };
  setSelectedRowClassName = record => {
    return record.id == this.state.rowSelected ? styles.selected_row : '';
  };

  render() {
    const { dataSource, selectedRows } = this.state;
    const {
      rule: { data },
      loading,
    } = this.props;
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 8,
      style: { marginBottom: 24 },
    };
    return (
      <GridContent>
        <div className="main-24">
          <Suspense fallback={<PageLoading />}>
            <Row gutter={24}>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_blue">
                  <div className="visual">
                    <img src={deliveryman} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">11</div>
                    <div className="desc">工作配送员</div>
                  </div>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_red">
                  <div className="visual">
                    <img src={no_order} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">11</div>
                    <div className="desc">未接单数</div>
                  </div>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_purple">
                  <div className="visual">
                    <img src={deliverymanimg} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">11</div>
                    <div className="desc">配送中</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Suspense>
          <div className={stylesList.twoColLayout}>
            <Row gutter={24} type="flex">
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Suspense fallback={null}>
                  <Card>
                    <div>
                      <AutoComplete
                        dataSource={dataSource}
                        style={{ width: '100%' }}
                        onSelect={this.onSelectMap}
                        onSearch={this.handleSearchMap}
                        placeholder="搜索区域"
                      />
                    </div>
                    <div className={stylesList.map}></div>
                  </Card>
                </Suspense>
              </Col>
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Suspense fallback={null}>
                  <Card>
                    <div style={{ marginBottom: 15 }}>
                      <Radio.Group value={'status1'} onChange={this.handleTabChange}>
                        <Radio.Button value="status1">未接单（24）</Radio.Button>
                        <Radio.Button value="status2">待取货（8）</Radio.Button>
                        <Radio.Button value="status3">配送中（2）</Radio.Button>
                        <Radio.Button value="status4">所有（34）</Radio.Button>
                      </Radio.Group>
                    </div>
                    <div className={styles.tableList}>
                      <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
                      <StandardTable
                        rowKey={list => list.id}
                        selectedRows={selectedRows}
                        loading={loading}
                        data={data}
                        columns={this.columns}
                        onChange={this.handleStandardTableChange}
                        rowSelection={null}
                        onRow={this.onSelectedRows}
                        rowClassName={this.setSelectedRowClassName}
                      />
                    </div>
                  </Card>
                </Suspense>
              </Col>
            </Row>
          </div>
        </div>
      </GridContent>
    );
  }
}

export default DispatchCenterList;
