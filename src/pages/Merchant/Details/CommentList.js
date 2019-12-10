import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, Spin, DatePicker, Popconfirm, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import stylesIndex from './index.less';
import styles from '@/assets/css/TableList.less';
import confingVar from '@/utils/configVar';
import utils from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;
const type = { 1: '订单收入', 2: '订单退款', 3: '订单索赔', 4: '平台奖励', 5: '提现' };

@connect(({ mdish, loading }) => ({
  mdish,
  loading: loading.effects['mdish/fetchCommentList'],
}))
@Form.create()
class CommentList extends Component {
  state = {
    merchant_id: '',
    page: confingVar.page,
    pagesize: confingVar.pagesize,
    modalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  componentDidMount() {
    const { params } = this.props;

    this.setState({
      merchant_id: params.id,
    }, () => {
      this.getList();
    }
    );
  }

  getList = params => {
    const { dispatch } = this.props;

    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      merchant_id: this.state.merchant_id,
      ...params,
    };

    dispatch({
      type: 'mdish/fetchCommentList',
      payload: getParams,
    });
  };

  columns = [
    {
      title: '订单号',
      width: 300,
      dataIndex: 'order_no',
    },
    {
      title: '商品名称',
      width: 280,
      render: (text, record) => (
        <div>
          {(record.dishes_name || []).map((item, i) => {
            return (
              <div key={i}>{item}</div>
            );
          })}
        </div>
      ),
    },
    {
      title: '评论内容',
      width: 300,
      dataIndex: 'content',
    },
    {
      title: '评分',
      width: 300,
      dataIndex: 'star',
    },
    {
      title: '评论人',
      width: 300,
      dataIndex: 'user_info.nickname',
    },
    {
      title: '商家回复',
      width: 300,
      dataIndex: 'reply_content',
    },
    {
      title: '评论时间',
      width: 300,
      dataIndex: 'create_time'
    },
    {
      title: '操作',
      width: 180,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>查看图片</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = pagination => {
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
    this.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['query_date_time'];
      const values = {
        ...fieldsValue,
        query_date_time: utils.getDateTimeMap(rangeTimeValue),
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  handleDelete = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', fields.id);
    formData.append('merchant_id', this.state.merchant_id);

    confirm({
      title: '温馨提示',
      content: '确认是否删除该评论？',
      onOk: () => {
        dispatch({
          type: 'mdish/fetchMerchantCommentDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="订单号">
              {getFieldDecorator('order_no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="商品名称">
              {getFieldDecorator('dish_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="评论人">
              {getFieldDecorator('user_info')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="评论时间">
              {getFieldDecorator('query_date_time')(
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
          <Col xl={3} md={8} sm={24}>
            <FormItem label="评分">
              {getFieldDecorator('star')(
                <Select placeholder="请选择" allowClear>
                  <Option value="1" key="1">1</Option>
                  <Option value="2" key="2">2</Option>
                  <Option value="3" key="3">3</Option>
                  <Option value="4" key="4">4</Option>
                  <Option value="5" key="5">5</Option>
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

  render() {
    const { loading, mdish: { commentList = {} } } = this.props;

    return (
      <GridContent>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={commentList}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </GridContent>
    );
  }
}

export default CommentList;
