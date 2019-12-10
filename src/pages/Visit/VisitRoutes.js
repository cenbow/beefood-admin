import React, { Component } from 'react';
import { Row, Col, Card, Form, Input, Button, DatePicker, Select } from 'antd';
import { connect } from 'dva';
import styles from '@/assets/css/TableList.less';
import tb from '@/assets/images/tb.png';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import mapboxgl from 'mapbox-gl';
import moment from 'moment';
const FormItem = Form.Item;
const { Option } = Select;

// 列表
@connect(({ visit, user, common, loading }) => ({
  visit,
  user,
  common,
  loading: loading.models.visit,
}))
@Form.create()
class VisitRoutes extends Component {
  state = {
    formValues: {},
    source_type: '',
    bd_id: '',
    username: '',
  };
  componentDidMount() {
    // this.getList();
    this.getNewDay();
    this.getCurrent();
  }
  //获取下级的BD人员
  getBdListForForm = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/getBdListForForm',
      payload: { pid: id },
    });
  };
  //获取当前的用户角色 //类型 1=超级管理员 2=普通管理员 3=BD人员 4=BD负责人 5-站长
  getCurrent = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
      callback: res => {
        if (res.code == 200) {
          if (res.data.items.source_type == 1 || 3 || 4) {
            var data = {};
            this.setState({
              source_type: res.data.items.source_type,
              bd_id: res.data.items.source_id,
              username: res.data.items.username,
            });
          }
          if (res.data.items.source_type == 3) {
            form.setFieldsValue({
              bd_id: res.data.items.source_id,
            });
            data.bd_id = res.data.items.source_id;
            data.create_time = this.state.create_time;
            this.getList(data);
          }
          if (res.data.items.source_type == 4) {
            this.getBdListForForm(res.data.items.source_id);
            data.create_time = this.state.create_time;
            this.getList(data);
          }
          if (res.data.items.source_type == 1) {
            this.getBdListForForm();
            data.create_time = this.state.create_time;
            this.getList(data);
          }
        }
      },
    });
  };
  //获取当前的日期
  getNewDay = () => {
    var day2 = new Date();
    day2.setTime(day2.getTime());
    var s2 = day2.getFullYear() + '-' + (day2.getMonth() + 1) + '-' + day2.getDate();
    const { form } = this.props;
    this.setState({
      create_time: Math.round(new Date().setHours(0, 0, 0) / 1000).toString()+','+Math.round(new Date().setHours(23, 59, 59) / 1000).toString(),
    });
    form.setFieldsValue({
      create_time: moment(s2, 'YYYY/MM/DD'),
    });
  };
  //获取地图路径
  getList = params => {
    const { dispatch } = this.props;
    var page, pagesize;
    localStorage.getItem('current') == undefined
      ? (page = 1)
      : (page = localStorage.getItem('current'));
    localStorage.getItem('pagesize') == undefined
      ? (pagesize = 25)
      : (page = localStorage.getItem('pagesize'));
    let getParams = {
      page: page,
      pagesize: pagesize,
      ...params,
    };
    //获取地图
    mapboxgl.accessToken = configVar.mapConfig.accessToken;
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
    });
    map.on('load', () => {
      utils.onMapStyleLoad(map);
    });

    dispatch({
      type: 'visit/fetchAdminPath',
      payload: getParams,
      callback: res => {
        if (res.code == 200) {
          var marker;
          var geojson;
          var arr = [];
          var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [
              parseFloat(res.data.items.gps_data[0].gps.split(',')[1]),
              parseFloat(res.data.items.gps_data[0].gps.split(',')[0]),
            ],
            zoom: 8,
          });
          res.data.items.gps_data.forEach(item => {
            marker = new mapboxgl.Marker()
              .setLngLat([parseFloat(item.gps.split(',')[1]), parseFloat(item.gps.split(',')[0])])
              .addTo(map);
            arr.push([parseFloat(item.gps.split(',')[1]), parseFloat(item.gps.split(',')[0])]);
          });
          geojson = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: arr,
                },
              },
            ],
          };
          map.on('load', function() {
            // add the line which will be modified in the animation
            map.addLayer({
              id: 'line-animation',
              type: 'line',
              source: {
                type: 'geojson',
                data: geojson,
              },
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#3fb1ce',
                'line-width': 10,
                'line-opacity': 0.8,
              },
            });
          });
        }
      },
    });
  };
  //搜索
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
        // create_time: fieldsValue.create_time && fieldsValue.create_time.valueOf(),
        create_time: fieldsValue.create_time && utils.getDateTime(fieldsValue.create_time) + ',' + utils.getDateTime(fieldsValue.create_time),
      };

      this.setState({
        formValues: values,
      });

      this.getList(values);
    });
  };
  render() {
    const {
      form: { getFieldDecorator },
      common: { bdListForForm },
    } = this.props;
    const { source_type, bd_id, username } = this.state;
    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">拜访路径</span>
        </div>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>
            <Form onSubmit={this.handleSearch} layout="inline">
              <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
                {source_type == 3 && (
                  <Col xl={4} md={8} sm={24}>
                    <FormItem label="所属BD">
                      {getFieldDecorator('bd_id', {})(
                        <Select placeholder="请选择" style={{ width: '100%' }} disabled>
                          <Option value={bd_id}>
                            {username}
                          </Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                )}
                {source_type == 4 && (
                  <Col xl={4} md={8} sm={24}>
                    <FormItem label="所属BD">
                      {getFieldDecorator('bd_id', {})(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {bdListForForm &&
                            bdListForForm.map((item, i) => (
                              <Option value={item.id} key={i}>
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                )}
                {source_type == 1 && (
                  <Col xl={4} md={8} sm={24}>
                    <FormItem label="所属BD">
                      {getFieldDecorator('bd_id', {})(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {bdListForForm &&
                            bdListForForm.map((item, i) => (
                              <Option value={item.id} key={i}>
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                )}
                <Col xl={4} md={8} sm={24}>
                  <FormItem label="拜访日期">
                    {getFieldDecorator('create_time')(<DatePicker />)}
                  </FormItem>
                </Col>
                <Col xl={4} md={8} sm={24}>
                  <span className={styles.submitButtons}>
                    <Button type="primary" htmlType="submit">
                      查询
                    </Button>
                  </span>
                </Col>
              </Row>
            </Form>
          </div>
          <div className="map" style={{ width: 780, height: 460, backgroundColor: '#ccc' }}>
            <div id="map" style={{ height: '460px' }}></div>
          </div>
        </div>
      </Card>
    );
  }
}

export default VisitRoutes;
