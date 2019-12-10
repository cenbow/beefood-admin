import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Alert, Button, Modal, Tabs, message, Row, Col } from 'antd';
import utils from '@/utils/utils';
import styles from './index.less';
import DealAudit from './DealAudit';
import mapboxgl from 'mapbox-gl';
// import MapboxDraw from '@mapbox/mapbox-gl-draw';
import ReactMapboxGl, { Marker, MapContext, GeoJSONLayer, ZoomControl, } from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import configVar from '@/utils/configVar';

const Map = ReactMapboxGl({
  accessToken: configVar.mapConfig.accessToken,
});
// mapboxgl.accessToken = configVar.mapConfig.accessToken;

const { TabPane } = Tabs;
const business_type = { '1': '营业中', '2': '暂停营业', '3': '筹建中', '4': '已关门' };
const open_weeks = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const book_reminder_time = { '1800': '30分钟', '2700': '45分钟', '4500': '1小时15分', '5400': '1小时30分', '6300': '1小时45分', '7200': '2小时' };
const allow_self_pick = { '1': '支持', '2': '不支持' };
const book_time = { '-1': '不支持', '1': '当天', '2': '明天', '3': '后天' };
const book_rest = { '1': '支持', '2': '不支持' };
const delivery_type = { '1': '平台专送', '2': '全城送', '3': '商家自配送' };

@connect(({ merchant, common, loading }) => ({
  muserShopInfo: merchant.muserShopInfo,
  image_domain: common.commonConfig.image_domain,
  loading: loading.effects['merchant/fetchMuserShopInfo'],
}))
class ShopInfo extends Component {
  state = {
    merchant_id: '',
    info_verify_type: '2',
    modalVisible: false,
    infoData: {},
    newInfoData: {},
    center: [104.91667, 11.55],
    zoom: [12],
    platform_gps_list_data: {},
    new_platform_gps_list_data: {},
    sys_city_gps_list_data: {},
    self_delivery_gps_list_data: {},
    new_self_delivery_gps_list_data: {}
  }

  componentDidMount () {
    const { match } = this.props;
    this.setState({
      merchant_id: match.params.id,
    }, () => {
      this.getInfo();
    });
  }

  getInfo = () => {
    const { dispatch } = this.props;
    // 获取认证状态信息
    dispatch({
      type: 'merchant/fetchMuserShopInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        console.log('获取认证状态信息', data);

        // 设置门店中心点
        const shopGps = data.gps
        const newShopGps = []
        shopGps.forEach((e, i) => {
          newShopGps.push(Number(e))
        })

        this.setState({
          infoData: data,
          center: newShopGps
        }, () => {
          if (data.verify_data) {
            this.setState({
              newInfoData: data.verify_data,
            });
          }
        });
        this.initMap(data)
      }
    });
  }

  handleMapData = (data) => {
    var arr1 = [];
    var arr2 = [];
    var data1 = {};
    data.forEach(item => {
      var arr = [];
      arr.push(item.lon);
      arr.push(item.lat);
      arr1.push(arr);
    });
    arr2.push(arr1);
    data1 = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: arr2,
          },
        },
      ],
    };
    return data1
  }

  initMap = (data) => {

    if (data) {
      const platform_gps_list = data.platform_gps_list ? data.platform_gps_list : null
      const city_delivery_info = data.city_delivery_info ? data.city_delivery_info : null
      const self_delivery_info = data.self_delivery_info ? data.self_delivery_info : null
      const verify_data = data.verify_data ? data.verify_data : null

      // 平台专送
      platform_gps_list ? this.setState({ platform_gps_list_data: this.handleMapData(platform_gps_list) }) : null

      city_delivery_info && city_delivery_info.sys_city && city_delivery_info.sys_city.gps_list ? this.setState({ sys_city_gps_list_data: this.handleMapData(city_delivery_info.sys_city.gps_list) }) : null

      if (self_delivery_info) {
        this.setState({
          self_delivery_gps_list_data: this.handleMapData(self_delivery_info[0].gps_list)
        });
      }

      // verify_data数据
      if (verify_data) {
        const new_platform_gps_list = verify_data.platform_gps_list ? verify_data.platform_gps_list : null
        const new_self_delivery_info = verify_data.self_delivery_info ? verify_data.self_delivery_info : null

        // 更改后平台专送
        new_platform_gps_list ? this.setState({ new_platform_gps_list_data: this.handleMapData(utils.isJsonParse(new_platform_gps_list)) }) : null

        if (new_self_delivery_info) {
          this.setState({
            new_self_delivery_gps_list_data: this.handleMapData(new_self_delivery_info[0].gps_list)
          });
        }

      }



    }


  };



  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  // 审核不通过
  handleSubmit = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('merchant_id', this.state.merchant_id);
    formData.append('verify_type', this.state.info_verify_type);
    formData.append('verify_status', '3');
    formData.append('verify_fail_message', fields.verify_fail_message);
    dispatch({
      type: 'merchant/fetchDealAudit',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        this.handleModalVisible(false);
        message.success('操作成功', 0.5, () => {
          // window.scrollTo(0, 0);
          // this.getInfo();
          location.reload();
        });
        // this.getInfo();
      },
    });
  };

  // 审核通过
  onDealAudit = () => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: '审核通过',
      content: '确定基本信息资料审核通过？',
      onOk: () => {
        let formData = new FormData();
        formData.append('merchant_id', this.state.merchant_id);
        formData.append('verify_type', this.state.info_verify_type);
        formData.append('verify_status', '2');
        dispatch({
          type: 'merchant/fetchDealAudit',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('通过审核', 0.5, () => {
              // window.scrollTo(0, 0);
              // this.getInfo();
              location.reload();
            });
          },
        });
      },
    });
  }

  // tab切换的点击事件
  onTabbox = (Key) => {
    const { infoData, sys_city_gps_list, self_delivery_gps_list } = this.state
    // console.log(Key);
    if (Key == 2) {
      infoData.city_delivery_info && infoData.city_delivery_info.sys_city.gps_list.length > 0 ? this.initMap(infoData.city_delivery_info.sys_city.gps_list) : null
    }
    if (Key == 3) {
      infoData.self_delivery_info && infoData.self_delivery_info[0].gps_list.length > 0 ? this.initMap(infoData.self_delivery_info[0].gps_list) : null
    }

  }

  renderMap (dataSource) {
    const { infoData, center, zoom } = this.state;
    // console.log('dataSource', dataSource)

    const onLoadMap = (map) => {
      const shopGPS = infoData.gps;
      map.flyTo({ center: shopGPS });
      const marker = new mapboxgl.Marker({}).setLngLat(shopGPS).addTo(map);
    }

    return (<div id="platformMap" style={{ width: '100%', height: 430 }}>
      <Map
        style="mapbox://styles/mapbox/streets-v9"
        onStyleLoad={map => { utils.onMapStyleLoad(map) }}
        containerStyle={{
          height: '100%',
          width: '100%',
        }}
        center={center}
        zoom={zoom}
      >
        <GeoJSONLayer
          data={dataSource}
          fillPaint={{
            'fill-color': '#FF9800',
            'fill-opacity': 0.5,
          }}
        />
        <MapContext.Consumer>
          {(map) => { onLoadMap(map) }}
        </MapContext.Consumer>
      </Map>
    </div>)
  }

  render () {
    const { modalVisible, infoData, newInfoData, center, zoom, platform_gps_list_data, sys_city_gps_list_data, self_delivery_gps_list_data, new_platform_gps_list_data, new_self_delivery_gps_list_data } = this.state;
    const { image_domain, loading } = this.props;
    const parentMethods = {
      handleSubmit: this.handleSubmit,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <Card bordered={false} bodyStyle={{ padding: 0, }} loading={loading}>
        {
          Object.keys((infoData || {})).length > 0 && (
            <div>
              <div className={styles.left}>
                {
                  infoData.verify_status == 2 && (
                    <Alert message="审核已通过" type="success" showIcon />
                  )
                }
                {
                  infoData.verify_status == 3 && (
                    <Alert message="审核不通过" type="error" showIcon />
                  )
                }
                {
                  infoData.verify_data && (
                    <Alert message="更改前" type="warning" showIcon />
                  )
                }
                <div className="m-t-16">
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.open_weeks, utils.jsonArray(newInfoData.open_weeks))}`}>
                    <dt className="common_dl_dt_140"><span>营业日</span>：</dt>
                    <dd className="common_dl_dd_140">
                      {
                        infoData.open_weeks.map((item, i) => {
                          if (i != 0) {
                            return (
                              <span key={i}>，{open_weeks[item]}</span>
                            );
                          }
                          return (
                            <span key={i}>{open_weeks[item]}</span>
                          );
                        })
                      }
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.open_schedule, utils.jsonArray(newInfoData.open_schedule))}`}>
                    <dt className="common_dl_dt_140"><span>营业时段</span>：</dt>
                    <dd className="common_dl_dd_140">
                      {
                        infoData.open_schedule.map((item, i) => {
                          if (i != 0) {
                            return (
                              <span key={i}>，{item[0]}~{item[1]}</span>
                            );
                          }
                          return (
                            <span key={i}>{item[0]}~{item[1]}</span>
                          );
                        })
                      }
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.is_allow_self_pick, newInfoData.is_allow_self_pick)}`}>
                    <dt className="common_dl_dt_140"><span>是否支持上门自提</span>：</dt>
                    <dd className="common_dl_dd_140">{allow_self_pick[infoData.is_allow_self_pick]}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.meal_time, newInfoData.meal_time)}`}>
                    <dt className="common_dl_dt_140"><span>备货时间</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.meal_time && infoData.meal_time + '分钟'}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.book_time, newInfoData.book_time)}`}>
                    <dt className="common_dl_dt_140"><span>预定单时间范围</span>：</dt>
                    <dd className="common_dl_dd_140">{book_time[infoData.book_time]}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.book_reminder_time, utils.jsonArray(newInfoData.book_reminder_time))}`}>
                    <dt className="common_dl_dt_140"><span>预定单提醒时间</span>：</dt>
                    <dd className="common_dl_dd_140">
                      {
                        (infoData.book_reminder_time || []).map((item, i) => {
                          if (i != 0) {
                            return (
                              <span key={i}>，{book_reminder_time[item]}</span>
                            );
                          }
                          return (
                            <span key={i}>{book_reminder_time[item]}</span>
                          );
                        })
                      }
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.book_rest, newInfoData.book_rest)}`}>
                    <dt className="common_dl_dt_140"><span>休息期间支持预定</span>：</dt>
                    <dd className="common_dl_dd_140">{book_rest[infoData.book_rest]}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.announcement_cn, newInfoData.announcement_cn)}`}>
                    <dt className="common_dl_dt_140"><span>商家公告</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.announcement_cn}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.min_consume, newInfoData.min_consume)}`}>
                    <dt className="common_dl_dt_140"><span>起送金额</span>：</dt>
                    <dd className="common_dl_dd_140">${infoData.min_consume / 100}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.delivery_type, newInfoData.delivery_type)}`}>
                    <dt className="common_dl_dt_140"><span>配送类型</span>：</dt>
                    <dd className="common_dl_dd_140">
                      {
                        infoData.delivery_type.map((item, i) => {
                          if (i != 0) {
                            return (
                              <span key={i}>，{delivery_type[item]}</span>
                            );
                          }
                          return (
                            <span key={i}>{delivery_type[item]}</span>
                          );
                        })
                      }
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.delivery_type, newInfoData.delivery_type)}`}>
                    <dt className="common_dl_dt_140"><span>配送设置</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <Tabs onChange={this.onTabbox} type="card">
                        {
                          infoData.delivery_type.indexOf('1') != -1 && (
                            <TabPane tab="平台专送" key="1">
                              <Row>

                                <Col span={4} className="col-label"><span>配送区域：</span></Col>
                                <Col span={20}>
                                  {this.renderMap(platform_gps_list_data)}
                                </Col>
                              </Row>
                              <Row className="m-t-16">
                                <Col span={4} className="col-label"><span>配送费：</span></Col>
                                <Col span={20}>
                                  <span>${infoData.city_delivery_info && infoData.city_delivery_info.basic_delivery_price / 100}</span>
                                </Col>
                              </Row>
                            </TabPane>
                          )
                        }
                        {
                          infoData.delivery_type.indexOf('2') != -1 && (
                            <TabPane tab="全城送" key="2" >
                              <Row className="m-t-16">
                                <Col span={4} className="col-label"><span>配送区域：</span></Col>
                                <Col span={20}>
                                  {this.renderMap(sys_city_gps_list_data)}
                                </Col>
                              </Row>
                              <Row className="m-t-16">
                                <Col span={4} className="col-label"><span>配送城市：</span></Col>
                                <Col span={20}>{infoData.city_name}</Col>
                              </Row>
                              <Row className="m-t-16">
                                <Col span={4} className="col-label"><span>基础配送费：</span></Col>
                                <Col span={20}>{infoData.city_delivery_info ? `$${infoData.city_delivery_info.basic_delivery_price / 100}` : undefined}</Col>
                              </Row>
                              <Row className="m-t-16">
                                <Col span={4} className="col-label"><span>距离附加费：</span></Col>
                                <Col span={20}>
                                  {infoData.city_delivery_info&&infoData.city_delivery_info.distance_append_price ? infoData.city_delivery_info.distance_append_price.map((items, i) => (
                                    <div>
                                      {infoData.city_delivery_info.distance_append_price[i].start_distance == undefined ? (<p>
                                        <span className='m-r-30'>{infoData.city_delivery_info.distance_append_price[i].end_distance}km以上</span>
                                        <span>每km加${infoData.city_delivery_info.distance_append_price[i].price / 100}</span>
                                      </p>) : (<p>
                                        <span className='m-r-30'>{infoData.city_delivery_info.distance_append_price[i].start_distance}km至{infoData.city_delivery_info.distance_append_price[i].end_distance}km</span>
                                        <span>每km加${infoData.city_delivery_info.distance_append_price[i].price / 100}</span>
                                      </p>)}
                                    </div>)) : undefined}
                                </Col>
                              </Row>

                            </TabPane>
                          )
                        }
                        {
                          infoData.delivery_type.indexOf('3') != -1 && (
                            <TabPane tab="商家自配送" key="3" className={`m-t-16 ${utils.objectContrast(newInfoData, JSON.stringify(infoData.self_delivery_info), JSON.stringify(newInfoData.self_delivery_info))}`} >
                              <Row className="m-t-16">
                                <Col span={4} className="col-label"><span>配送区域：</span></Col>
                                <Col span={20}>
                                  {this.renderMap(self_delivery_gps_list_data)}
                                </Col>
                              </Row>

                              {

                                (infoData.self_delivery_info || []).map((item, i) => {
                                  if (i != 0) {
                                    return (
                                      <div>
                                        <Row className="m-t-16">
                                          <Col span={4} className="col-label"><span>配送费：</span></Col>
                                          <Col span={20} key={i}>${infoData.self_delivery_info[i].delivery_price / 100}</Col>
                                        </Row>
                                        <Row className="m-t-16">
                                          <Col span={4} className="col-label"><span>配送时间：</span></Col>
                                          <Col span={20} key={i}>{infoData.self_delivery_info[i].delivery_time}分钟</Col>
                                        </Row>
                                      </div>

                                    );
                                  }
                                  return (
                                    <div>
                                      <Row className="m-t-16">
                                        <Col span={4} className="col-label"><span>配送费：</span></Col>
                                        <Col span={20} key={i}>${infoData.self_delivery_info[i].delivery_price / 100}</Col>
                                      </Row>
                                      <Row className="m-t-16">
                                        <Col span={4} className="col-label"><span>配送时间：</span></Col>
                                        <Col span={20} key={i}>{infoData.self_delivery_info[i].delivery_time}分钟</Col>
                                      </Row>
                                    </div>
                                  );
                                })
                              }

                            </TabPane>
                          )
                        }
                      </Tabs>
                    </dd>
                  </dl>
                  <dl className="common_dl">
                    <dt className="common_dl_dt_140">平台佣金抽成：</dt>
                    <dd className="common_dl_dd_140">
                      <p>
                        <span className={`m-r-30 ${utils.objectContrast(newInfoData, infoData.percent_platform, newInfoData.percent_platform)}`}>
                          平台专送佣金比例：{infoData.percent_platform}%
                        </span>
                        <span className={`${utils.objectContrast(newInfoData, infoData.min_order_web_amount_platform, newInfoData.min_order_web_amount_platform)}`}>
                          保底抽成：${infoData.min_order_web_amount_platform / 100}
                        </span>
                      </p>
                      {infoData.delivery_type.indexOf('3') != -1 && (<p>
                        <span className={`m-r-30 ${utils.objectContrast(newInfoData, infoData.percent_self, newInfoData.percent_self)}`}>商家自配送佣金比例：{infoData.percent_self}%</span>
                        <span className={`${utils.objectContrast(newInfoData, infoData.min_order_web_amount_self, newInfoData.min_order_web_amount_self)}`}>保底抽成：${infoData.min_order_web_amount_self / 100}</span>
                      </p>)}

                      {infoData.is_allow_self_pick == 1 && (<p>
                        <span className={`m-r-30 ${utils.objectContrast(newInfoData, infoData.percent_take, newInfoData.percent_take)}`}>上门自提佣金比例：{infoData.percent_take}%</span>
                        <span className={`${utils.objectContrast(newInfoData, infoData.min_order_web_amount_take, newInfoData.min_order_web_amount_take)}`}>保底抽成：${infoData.min_order_web_amount_take / 100}</span>
                      </p>)
                      }

                    </dd>
                  </dl>
                  <dl className="common_dl">
                    <dt className="common_dl_dt_140"></dt>
                    <dd className="common_dl_dd_140">
                      {
                        (infoData.verify_status == 1 || infoData.verify_data) && (
                          <div>
                            <Button type="primary" onClick={this.onDealAudit}>审核通过</Button>
                            <Button style={{ marginLeft: 8 }} onClick={() => { this.handleModalVisible(true) }}>审核不通过</Button>
                          </div>
                        )
                      }
                    </dd>
                  </dl>
                </div>
              </div>
              <div className={styles.right}>
                {
                  infoData.verify_status == 3 && (
                    <div className="verify_status_box">
                      <div className="verify_status_title">审核不通过原因</div>
                      <div className="verify_status_cont">
                        <p>{infoData.verify_fail_message}</p>
                      </div>
                    </div>
                  )
                }
                {
                  infoData.verify_data && (
                    <div>
                      <Alert message="更改后" type="warning" showIcon />
                      <div className="m-t-16">
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.open_weeks, utils.jsonArray(newInfoData.open_weeks))}`}>
                          <dt className="common_dl_dt_140"><span>营业日</span>：</dt>
                          <dd className="common_dl_dd_140">
                            {
                              utils.jsonArray(newInfoData.open_weeks).map((item, i) => {
                                if (i != 0) {
                                  return (
                                    <span key={i}>，{open_weeks[item]}</span>
                                  );
                                }
                                return (
                                  <span key={i}>{open_weeks[item]}</span>
                                );
                              })
                            }
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.open_schedule, utils.jsonArray(newInfoData.open_schedule))}`}>
                          <dt className="common_dl_dt_140"><span>营业时段</span>：</dt>
                          <dd className="common_dl_dd_140">
                            {
                              utils.jsonArray(newInfoData.open_schedule).map((item, i) => {
                                if (i != 0) {
                                  return (
                                    <span key={i}>，{item[0]}~{item[1]}</span>
                                  );
                                }
                                return (
                                  <span key={i}>{item[0]}~{item[1]}</span>
                                );
                              })
                            }
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.is_allow_self_pick, newInfoData.is_allow_self_pick)}`}>
                          <dt className="common_dl_dt_140"><span>是否支持上门自提</span>：</dt>
                          <dd className="common_dl_dd_140">{allow_self_pick[newInfoData.is_allow_self_pick]}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.meal_time, newInfoData.meal_time)}`}>
                          <dt className="common_dl_dt_140"><span>备货时间</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.meal_time && newInfoData.meal_time + '分钟'}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.book_time, newInfoData.book_time)}`}>
                          <dt className="common_dl_dt_140"><span>预定单时间范围</span>：</dt>
                          <dd className="common_dl_dd_140">{book_time[newInfoData.book_time]}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.book_reminder_time, utils.jsonArray(newInfoData.book_reminder_time))}`}>
                          <dt className="common_dl_dt_140"><span>预定单提醒时间</span>：</dt>
                          <dd className="common_dl_dd_140">
                            {
                              (utils.jsonArray(newInfoData.book_reminder_time)).map((item, i) => {
                                if (i != 0) {
                                  return (
                                    <span key={i}>，{book_reminder_time[item]}</span>
                                  );
                                }
                                return (
                                  <span key={i}>{book_reminder_time[item]}</span>
                                );
                              })
                            }
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.book_rest, newInfoData.book_rest)}`}>
                          <dt className="common_dl_dt_140"><span>休息期间支持预定</span>：</dt>
                          <dd className="common_dl_dd_140">{book_rest[newInfoData.book_rest]}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.announcement_cn, newInfoData.announcement_cn)}`}>
                          <dt className="common_dl_dt_140"><span>商家公告</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.announcement_cn}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.min_consume, newInfoData.min_consume)}`}>
                          <dt className="common_dl_dt_140"><span>起送金额</span>：</dt>
                          <dd className="common_dl_dd_140">${newInfoData.min_consume / 100}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.delivery_type, utils.string_to_array(newInfoData.delivery_type))}`}>
                          <dt className="common_dl_dt_140"><span>配送类型</span>：</dt>
                          <dd className="common_dl_dd_140">
                            {
                              utils.string_to_array(newInfoData.delivery_type).map((item, i) => {
                                if (i != 0) {
                                  return (
                                    <span key={i}>，{delivery_type[item]}</span>
                                  );
                                }
                                return (
                                  <span key={i}>{delivery_type[item]}</span>
                                );
                              })
                            }
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.delivery_type, utils.string_to_array(newInfoData.delivery_type))}`}>
                          <dt className="common_dl_dt_140"><span>配送设置</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <Tabs onChange={this.onTabbox} type="card">
                              {
                                utils.string_to_array(newInfoData.delivery_type).indexOf('1') != -1 && (
                                  <TabPane tab="平台专送" key="1">
                                    <Row>
                                      <Col span={4} className="col-label"><span>配送区域：</span></Col>
                                      <Col span={20}>
                                        {this.renderMap(new_platform_gps_list_data)}
                                      </Col>
                                    </Row>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>配送费：</span></Col>
                                      <Col span={20}>
                                        <span>${infoData.city_delivery_info && infoData.city_delivery_info.basic_delivery_price / 100}</span>
                                      </Col>
                                    </Row>
                                  </TabPane>
                                )
                              }
                              {
                                utils.string_to_array(newInfoData.delivery_type).indexOf('2') != -1 && (
                                  <TabPane tab="全城送" key="2" >
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>配送区域：</span></Col>
                                      <Col span={20}>
                                        {this.renderMap(sys_city_gps_list_data)}
                                      </Col>
                                    </Row>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>配送城市：</span></Col>
                                      <Col span={20}>{infoData.city_name}</Col>
                                    </Row>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>基础配送费：</span></Col>
                                      <Col span={20}>{infoData.city_delivery_info ? `$${infoData.city_delivery_info.basic_delivery_price / 100}` : undefined}</Col>
                                    </Row>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>距离附加费：</span></Col>
                                      <Col span={20}>
                                        {infoData.city_delivery_info && infoData.city_delivery_info.distance_append_price ? infoData.city_delivery_info.distance_append_price.map((items, i) => (
                                          <div>
                                            {
                                              infoData.city_delivery_info.distance_append_price[i].start_distance == undefined ? (<p>
                                                <span className='m-r-30'>{infoData.city_delivery_info.distance_append_price[i].end_distance}km以上</span>
                                                <span>每km加${infoData.city_delivery_info.distance_append_price[i].price / 100}</span>
                                              </p>) : (<p>
                                                <span className='m-r-30'>{infoData.city_delivery_info.distance_append_price[i].start_distance}km至{infoData.city_delivery_info.distance_append_price[i].end_distance}km</span>
                                                <span>每km加${infoData.city_delivery_info.distance_append_price[i].price / 100}</span>
                                              </p>)
                                            }
                                          </div>
                                        )) : undefined}
                                      </Col>
                                    </Row>
                                  </TabPane>
                                )
                              }
                              {
                                utils.string_to_array(newInfoData.delivery_type).indexOf('3') != -1 && (
                                  <TabPane tab="商家自配送" key="3" className={`m-t-16 ${utils.objectContrast(newInfoData, JSON.stringify(newInfoData.self_delivery_info), JSON.stringify(infoData.self_delivery_info))}`}>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>配送区域：</span></Col>
                                      <Col span={20}>
                                        {this.renderMap(new_self_delivery_gps_list_data)}
                                      </Col>
                                    </Row>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>配送费：</span></Col>
                                      <Col span={20}>${newInfoData.self_delivery_info[0].delivery_price / 100}</Col>
                                    </Row>
                                    <Row className="m-t-16">
                                      <Col span={4} className="col-label"><span>配送时间：</span></Col>
                                      <Col span={20}>{newInfoData.self_delivery_info[0].delivery_time}分钟</Col>
                                    </Row>
                                  </TabPane>
                                )
                              }
                            </Tabs>
                          </dd>
                        </dl>
                        <dl className="common_dl">
                          <dt className="common_dl_dt_140">平台佣金抽成：</dt>
                          <dd className="common_dl_dd_140">
                            <p>
                              <span className={`m-r-30 ${utils.objectContrast(newInfoData, infoData.percent_platform, newInfoData.percent_platform)}`}>平台专送佣金比例：{newInfoData.percent_platform}%</span>
                              <span className={`${utils.objectContrast(newInfoData, infoData.min_order_web_amount_platform, newInfoData.min_order_web_amount_platform)}`}>保底抽成：${newInfoData.min_order_web_amount_platform / 100}</span>
                            </p>
                            {
                              utils.string_to_array(newInfoData.delivery_type).indexOf('3') != -1 && (<p>
                                <span className={`m-r-30 ${utils.objectContrast(newInfoData, infoData.percent_self, newInfoData.percent_self)}`}>商家自配送佣金比例：{newInfoData.percent_self}%</span>
                                <span className={`${utils.objectContrast(newInfoData, infoData.min_order_web_amount_self, newInfoData.min_order_web_amount_self)}`}>保底抽成：${newInfoData.min_order_web_amount_self / 100}</span>
                              </p>)
                            }
                            {newInfoData.is_allow_self_pick == 1 && (<p>
                              <span className={`m-r-30 ${utils.objectContrast(newInfoData, infoData.percent_take, newInfoData.percent_take)}`}>上门自提佣金比例：{newInfoData.percent_take}%</span>
                              <span className={`${utils.objectContrast(newInfoData, infoData.min_order_web_amount_take, newInfoData.min_order_web_amount_take)}`}>保底抽成：${newInfoData.min_order_web_amount_take / 100}</span>
                            </p>)
                            }

                          </dd>
                        </dl>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          )
        }
        <DealAudit {...parentMethods} modalVisible={modalVisible} />
      </Card>
    )
  }
}

export default ShopInfo;