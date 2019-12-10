import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Tabs, Table, Modal, message, Badge, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import styles from '@/assets/css/TableList.less';
import utils, { getMenu } from '@/utils/utils';
import ShowImg from '@/components/showImg';
import {
  getCountry,
  getCity,
  getRegion,
  getBusiness,
} from '@/services/common';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const statusMap = ['', 'success', 'default', 'warning', 'processing', 'error'];
const status = ['', '启用', '禁用'];
const adsType = ['', '外链', '商家详情', '菜品详情', '专题页'];
const title = ['', '启动页', '首页弹窗', '首页顶部', '推荐专区', '订单详情页'];

@connect(({ ads, common, loading }) => ({
  ads,
  common,
  loading: loading.effects['ads/fetchBannerList'],
}))
@Form.create()
class AdsList extends PureComponent {
  state = {
    position: null,
    country: [],
    citys: [],
    regions: [],
    business: [],
    formValues: {},
  };

  columns = [
    {
      title: '序号',
      dataIndex: 'sort',
    },
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '投放区域',
      render: (record) => (
        <span>{record.sys_country.name}>{record.sys_city.name}>{record.sys_region.name}</span>
      )
    },
    {
      title: '投放商圈',
      render: (record) => (<span>
        {(record.sys_banner_business || []).map((item, i) => {
          if (record.sys_banner_business.length == i + 1) {
            return <span key={i}>{item.sys_business && item.sys_business.name}</span>;
          }
          return <span key={i}>{item.sys_business && item.sys_business.name},</span>;
        })}
      </span>)

    },
    {
      title: '图片',
      dataIndex: 'image',
      render: url => <ShowImg className="avatar-48" src={url} />,
    },
    {
      title: '广告名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render (val) {
        return <span>{adsType[val]}</span>
      }
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '开始时间',
      dataIndex: 'show_start_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '结束时间',
      dataIndex: 'show_end_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '点击量',
      dataIndex: 'click',
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
      width: 150,
      render: (text, record) => (
        <Fragment>
          <Link to={`/config/base/ads/create?type=${this.state.position}&editType=1&id=${record.id}`}>编辑</Link>
          <Divider type="vertical" />
          {
            record.status == 2 && (<span><a onClick={() => this.handleAbleStatus(record)}>启用</a>
              <Divider type="vertical" /></span>)
          }
          {
            record.status == 1 && (<span><a onClick={() => this.handleDisableStatus(record)}>禁用</a>
              <Divider type="vertical" /></span>)
          }

          < a onClick={() => this.handleDelete(record)}> 删除</a >
        </Fragment >
      ),
    },
  ];

  componentDidMount () {
    const { common, match } = this.props;
    const { country = [], city = [], region = [], business = [] } = common;
    const position = Number(this.props.match.params.type)



    this.setState({
      country: country,
      citys: city,
      regions: region,
      business: business,
      position: position
    }, () => {
      console.log('位置 1-启动页(默认) 2-首页弹窗 3-首页顶部 4-推荐专区 5-订单详情页>>>', this.state.position);
      this.getList();
    });
    this.getCommon();
  }

  getList = (params) => {
    const { dispatch } = this.props;
    const { position } = this.state;
    let getParams = {
      position: position,
      page: 1,
      pagesize: 25,
      ...params
    }
    dispatch({
      type: 'ads/fetchBannerList',
      payload: getParams
    });
  }


  getCommon = () => {
    const { dispatch } = this.props;
    //获取全部的国家
    dispatch({
      type: 'common/getCountry',
      callback: res => {
        if (res.code == 200) {
          if (res.data.items.length > 0) {
            //获取全部的城市
            dispatch({
              type: 'common/getCity',
              payload: {
                country_id: res.data.items[0].id,
              },
              callback: res => {
                //获取全部的区域
                if (res.code == 200) {
                  if (res.data.items.length > 0) {
                    dispatch({
                      type: 'common/getRegion',
                      payload: {
                        city_id: res.data.items[0].id,
                      },
                      callback: res => {
                        if (res.code == 200) {
                          //获取全部的商圈
                          if (res.data.items.length > 0) {
                            dispatch({
                              type: 'common/getBusiness',
                              payload: {
                                region_id: res.data.items[0].id,
                              },
                            });
                          }
                        }
                      },
                    });
                  }
                }
              },
            });
          }
        }
      },
    });
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
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定启用此广告吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'ads/fetchEnableBanner',
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
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定禁用此广告吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'ads/fetchDisableBanner',
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
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定删除此广告吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'ads/fetchDeleteBanner',
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

  handleStatus = (fields, name) => {
    console.log(fields);

  }

  renderSimpleForm () {
    const {
      form,
      common,
    } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { country = [] } = common;
    const { citys, regions, business } = this.state;
    const selectCountry = id => {
      this.setState({
        citys: [],
        regions: [],
        business: [],
      });
      const { form } = this.props;
      form.setFieldsValue({
        city_id: undefined,
        region_id: undefined,
        business_id: undefined,
      });
      if (!id) {
        form.setFieldsValue({
          citys: undefined,
        });
        this.setState({ citys: [] });
        return;
      }
      getCity({
        country_id: id,
      }).then(res => {
        if (!utils.successReturn(res)) return;
        this.setState({
          citys: res.data.items,
        });
      });
    };
    const selectCity = id => {
      this.setState({
        regions: [],
        business: [],
      });
      const { form } = this.props;
      form.setFieldsValue({
        region_id: undefined,
        business_id: undefined,
      });
      if (!id) {
        form.setFieldsValue({
          regions: undefined,
        });
        this.setState({ regions: [] });
        return;
      }
      getRegion({
        city_id: id,
      }).then(res => {
        if (!utils.successReturn(res)) return;
        this.setState({
          regions: res.data.items,
        });
      });
    };
    const selectRegions = id => {
      this.setState({
        business: [],
      });
      const { form } = this.props;
      form.setFieldsValue({
        business_id: undefined,
      });
      if (!id) {
        form.setFieldsValue({
          business: undefined,
        });
        this.setState({ business: [] });
        return;
      }
      getBusiness({
        region_id: id,
        is_all: 1,
      }).then(res => {
        if (!utils.successReturn(res)) return;
        this.setState({
          business: res.data.items,
        });
      });
    };


    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="国家">
              {form.getFieldDecorator('country_id', {
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={val => {
                    selectCountry(val);
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
          <Col md={6} sm={24}>
            <FormItem label="城市">
              {form.getFieldDecorator('city_id', {
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={val => {
                    selectCity(val);
                  }}
                >
                  {citys.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="区域">
              {form.getFieldDecorator('region_id', {
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={val => {
                    selectRegions(val);
                  }}
                >
                  {regions.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="商圈">
              {form.getFieldDecorator('business_id', {
              })(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {business.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }} style={{ marginTop: 10 }} >
          <Col md={6} sm={24}>
            <FormItem label="广告名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" allowClear />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="添加时间">
              {getFieldDecorator('create_time')(
                <RangePicker allowClear={false} />
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
          <Col md={6} sm={24} >
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form >
    );
  }

  render () {
    const {
      ads: { data },
      loading
    } = this.props;
    const { position } = this.state;
    // console.log('123', adsListData)
    return (
      <Fragment>
        <h3 className={styles.editTitle}><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> <p style={{ paddingTop: 24 }}>{title[position]}广告</p> </h3>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <div className={styles.tableListOperator}>
            {/* <Button icon="left" onClick={() => { router.goBack() }}><FormattedMessage id="form.back" /></Button> */}
            <Link style={{ float: "right", marginBottom: 10 }} to={`/config/base/ads/create?type=${position}&editType=0`}><Button icon="plus" type="primary">新增</Button></Link>
          </div>
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

export default AdsList;