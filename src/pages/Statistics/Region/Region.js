import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import {
  Row, Col, Card, Input, Form,
  Select,
  Icon,
  Button,
  message,
} from 'antd';

import StandardTable from '@/components/StandardTable';
import { getMenu } from '../../../utils/utils';
import styles from '@/assets/css/TableList.less';
import utils from '@/utils/utils';


import { getCountry, getCity, getRegion, getBusiness } from '@/services/common';

const FormItem = Form.Item;
const Option = Select.Option

@connect(({ region, common, loading }) => ({
  region,
  common,
  loading: loading.effects['region/fetchStatisticsUser'],
}))
@Form.create()
class Region extends PureComponent {
  state = {
    country: [],
    city: [],
    menu: [],
    formValues: {},
  };

  columns = [
    {
      title: '国家',
      dataIndex: 'country.country_name',
    },
    {
      title: '城市',
      dataIndex: 'city.city_name',
    },
    {
      title: '人数',
      dataIndex: 'user_amount',
    },
  ];

  componentDidMount () {
    this.getList();
    this.fetchMenu();
    this.getCountry();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'statistics', 'region'),
          });
        }
      },
    });
  };


  getCountry = id => {
    getCountry().then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        country: res.data.items,
      });
    });
  };


  getCity = id => {
    getCity({
      country_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        city: res.data.items,
      });
    });
  };


  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'region/fetchStatisticsUser',
      payload: getParams,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };
      this.setState({
        formValues: values,
      });
      // console.log('搜索参数', values);
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

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

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { country = [], city = [] } = this.state;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="国家">
              {getFieldDecorator('country_id')(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  onChange={val => {
                    this.getCity(val);
                  }}
                >
                  {country.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="城市">
              {getFieldDecorator('city_id')(<Select
                placeholder="请选择"
                style={{ width: '100%' }}
              >
                {city.map((item, i) => (
                  <Option value={item.id} key={i}>
                    {item.name}
                  </Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
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
    const { region: { data }, loading } = this.props;
    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">人数统计</span>
        </div>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.city_id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={data}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Card>
    );
  }
}
export default Region;
