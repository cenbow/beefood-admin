import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, Upload, Cascader, Checkbox, TimePicker, Tabs } from 'antd';
import { getTranslatorVal, goBack } from '@/utils/utils';
import utils from '@/utils/utils';
import defaultSettings from '@/defaultSettings';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import configVar from '@/utils/configVar';
import { getMuserShopInfo } from '@/services/mdish';
import moment from 'moment'; // 时间戳转换插件


import MapboxDraw from '@mapbox/mapbox-gl-draw';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
// const MapboxDraw = require('@mapbox/mapbox-gl-draw');

let open_schedule_tmp = []
const format = 'HH:mm';
let open_schedule_key_num = 1;
let delivery_area_key_num = 1;
let delivery_area_list_key = []
let post_delivery_area_list = []


let deliveryAreaId = 0;

const timeReg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/
const moneyReg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
const moneyKtReg = /^\D*([0-9]\d*\.?\d{0,2})?.*$/;
const timeRtReg = /^\D*([1-9]\d*)$/;

let ostimeArr = []
@connect(({ common, merchant, loading }) => ({
  common,
  merchant,
  loading: loading.models.merchant,
}))
@Form.create()
class ShopConfiguration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoData: {},
      gps: [104.91667, 11.55],//默认的地图起始点
      merchant_id: '', //商家ID
      verify_status: '0',//认证状态 1审核中 2通过 3不通过 为1时审核中不能修改
      verify_fail_message: '', //认证提示语
      activeKey: NaN,//tab切换的选中状态
      basic_delivery_price: '',//基础配送费
      distance_append_price: [],//附加费
      platform_gps_list: [],//平台专送多边形，json字符串
      self_delivery_info_id: '',//商家自配信息 修改时候带上
      self_delivery_info_gps_list: [], //商家自配信息 配送区域
      self_delivery_info: [],//商家自配信息
      city_name: '',
      delivery_area_key_map: 0,
      shopGps: '',
      sys_city_gps_list: [],//城市配送范围

    };
  }

  componentDidMount () {
    const { dispatch, form, params } = this.props;
    const { activeKey } = this.state;
    open_schedule_tmp = []
    delivery_area_list_key = []
    this.setState({
      merchant_id: params.id
    }, () => {
      // 获取信息列表
      this.getShopInfo(this.state.merchant_id)
    });



  }
  // 获取信息列表
  getShopInfo = id => {
    const { dispatch, form } = this.props
    const { getFieldDecorator, getFieldValue } = form;


    dispatch({
      type: 'mdish/fetchMuserShopInfo',
      payload: {
        merchant_id: id,
      },
      callback: (res) => {

        if (!utils.successReturn(res)) return;
        console.log('获取信息列表', res.data.items)
        let data = res.data.items

        const shopGps = data.gps
        const newShopGps = []
        shopGps.forEach((e, i) => {
          newShopGps.push(Number(e))
        })

        // 营业时间段 详情获取后的处理
        let old_open_schedule_data = [];
        let open_schedule_num = [];
        let open_schedule_data = data.open_schedule
        if (open_schedule_data && open_schedule_data.length > 0) {
          open_schedule_data.forEach((el, i) => {
            open_schedule_num.push(i);
            old_open_schedule_data.push(Object.assign({}, el))

          })
          let new_open_schedule_data = []
          old_open_schedule_data.forEach((item, index, arr) => {
            let obj = {};
            obj.os_startTime = arr[index][0]
            obj.os_endTime = arr[index][1]
            new_open_schedule_data.push(obj)
            open_schedule_tmp.push(obj);
          })
          // console.log('open_schedule_tmp', open_schedule_tmp);
          open_schedule_key_num = open_schedule_num.length;
          form.setFieldsValue({
            open_schedule_keys: open_schedule_num,
          });
        }

        // 商家自配 详情获取后的处理 
        let self_delivery_num = []
        let gpsList = []
        let self_delivery_data = data.self_delivery_info
        if (self_delivery_data && self_delivery_data.length > 0) {
          self_delivery_data.forEach((el, i) => {
            self_delivery_num.push(i);
            delivery_area_list_key.push(i);
            gpsList.push(el.gps_list);
            // console.log('777', el.gps_list, i);
          });
          {/* 单个配送区域 */ }
          // delivery_area_key_num = self_delivery_num.length;
          // form.setFieldsValue({
          //   delivery_area_keys: self_delivery_num,
          // }, () => {
          //   self_delivery_data.forEach((el, i) => {
          //     form.setFieldsValue({
          //       ['self_delivery_info[' + i + '].delivery_price']: el.delivery_price,
          //       ['self_delivery_info[' + i + '].delivery_time']: el.delivery_time,
          //     });
          //   });
          //   // 赋值坐标处理
          //   this.setState({
          //     self_delivery_info_gps_list: gpsList
          //   }, () => {
          //     // console.log('获取详情后的坐标', this.state.self_delivery_info_gps_list);
          //   })
          // });

        }


        // 全城送的地图坐标集合
        if (data.city_delivery_info && data.city_delivery_info.sys_city && data.city_delivery_info.gps_list) {
          data.city_delivery_info.sys_city.gps_list.map((e) => {
            return {
              lat: Number(e.lat),
              lon: Number(e.lon)
            }
          })
        }

        form.setFieldsValue({
          'open_weeks': data.open_weeks,
          'is_allow_self_pick': data.is_allow_self_pick,
          'meal_time': data.meal_time,
          'book_rest': data.book_rest,
          'book_time': data.book_time,
          'book_reminder_time': data.book_reminder_time ? data.book_reminder_time : null,
          'announcement_cn': data.announcement_cn,
          'announcement_en': data.announcement_en,
          'announcement_kh': data.announcement_kh,
          'delivery_type': data.delivery_type,
          'percent_platform': typeof (data.percent_platform) !== null ? `${data.percent_platform / 1}` : null,
          'percent_self': typeof (data.percent_self) !== null ? `${data.percent_self / 1}` : null,
          'percent_take': typeof (data.percent_take) !== null ? `${data.percent_take / 1}` : null,
          'min_order_web_amount_platform': typeof (data.min_order_web_amount_platform) !== null ? `${data.min_order_web_amount_platform / 100}` : null,
          'min_order_web_amount_self': typeof (data.min_order_web_amount_self) !== null ? `${data.min_order_web_amount_self / 100}` : null,
          'min_order_web_amount_take': typeof (data.min_order_web_amount_take) !== null ? `${data.min_order_web_amount_take / 100}` : null,
          'platform_gps_list': data.platform_gps_list,
          'self_delivery_info': data.self_delivery_info,
          // 'self_delivery_info.gps_list': data.self_delivery_info ? data.self_delivery_info.gps_list : null,
          // 'verify_fail_message': data.verify_fail_message,
          'min_consume': typeof (data.min_consume) !== null ? `${data.min_consume / 100}` : null,
          'self_delivery_info[0].delivery_price': data.self_delivery_info && typeof (data.self_delivery_info[0].delivery_price) !== null ? `${data.self_delivery_info[0].delivery_price / 100}` : null,
        }, () => {
          this.setState({
            infoData: data,
            verify_status: data.verify_status,
            verify_fail_message: data.verify_fail_message,
            basic_delivery_price: data.city_delivery_info ? data.city_delivery_info.basic_delivery_price : null,
            city_name: data.city_name,
            shopGps: newShopGps,
            distance_append_price: data.city_delivery_info && data.city_delivery_info.distance_append_price ? data.city_delivery_info.distance_append_price : null,
            platform_gps_list: data.platform_gps_list,
            sys_city_gps_list: data.city_delivery_info && data.city_delivery_info.sys_city ? data.city_delivery_info.sys_city.gps_list : null,
            self_delivery_info: data.self_delivery_info,
            self_delivery_info_gps_list: gpsList, // 赋值坐标处理
          }, () => {
            this.initMap('platformMap', newShopGps, this.state.platform_gps_list, form.getFieldValue('plat_delivery_area_radius'));
            // console.log('字段值 获取信息列表', this.state.infoData);
            // 获取地图数据
          });

        })

      }
    });


    // getMuserShopInfo({ merchant_id: id }).then(res => {

    // })

  }



  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    const { platform_gps_list, self_delivery_info_gps_list } = this.state;
    form.validateFields((err, values) => {

      //open_schedule处理
      if (values.open_schedule_keys) {
        let open_schedule_data = values.open_schedule_keys.map(key => values.open_schedule[key])
        // console.log('open_schedule_data', open_schedule_data)
        const timeArr = []
        open_schedule_data.forEach((item) => {
          const start = moment(item.os_startTime).format('HH:mm')
          const end = moment(item.os_endTime).format('HH:mm')
          timeArr.push([start, end])
        })
        values.open_schedule = JSON.stringify(timeArr);
      }

      // open_weeks处理
      if (values.open_weeks) {
        const open_weeksArr = values.open_weeks
        let newArr = [];
        open_weeksArr.forEach(el => {
          newArr.push(
            el.toString()
          );
        });
        values.open_weeks = JSON.stringify(newArr);
      }

      // // book_reminder_time 处理
      if (values.book_reminder_time) {
        const book_reminder_timeArr = values.book_reminder_time
        let newArr = [];
        book_reminder_timeArr.forEach(el => {
          newArr.push(
            el.toString()
          );
        });
        values.book_reminder_time = JSON.stringify(newArr);
      }

      // // delivery_type 去重转字符串处理
      if (values.delivery_type) {
        let set = new Set(values.delivery_type);
        let newArr = Array.from(set);
        values.delivery_type = newArr.toString()
        // console.log('values.delivery_typ2e', values.delivery_type)
      }

      // 平台专送处理
      if (values.delivery_type.indexOf("1") != -1) {
        // console.log('平台专送处理platform_gps_list', platform_gps_list)
        if (platform_gps_list) {
          if (platform_gps_list && platform_gps_list.length == 0) return message.error('请在平台专送地图中选取配送区域');
        } else {
          return message.error('请在平台专送地图中选取配送区域');
        }
      }

      // 商家自配送处理  
      if (values.delivery_type.indexOf("3") != -1) {
        if (values.self_delivery_info) {
          // console.log('si0', values.self_delivery_info, self_delivery_info_gps_list);
          if (self_delivery_info_gps_list.length == 0) return message.error('请在商家自配地图中选取配送区域');
          if (self_delivery_info_gps_list.length > 0) {
            values.self_delivery_info[0].gps_list = [] //先清空再赋值
            // console.log(values.self_delivery_info[0].gps_list)
            const newArrGpsList = values.self_delivery_info[0].gps_list
            for (let i = 0; i < self_delivery_info_gps_list.length; i++) {
              const element = self_delivery_info_gps_list[i];
              newArrGpsList.push(element)
            }
            // console.log('values.self_delivery_info>>>last', values.self_delivery_info);
            // values.self_delivery_info[0].gps_list = self_delivery_info_gps_list;
            values.self_delivery_info = JSON.stringify(values.self_delivery_info);
            // console.log('si1', values.self_delivery_info);
          }
        }




        {/* 单个配送区域 */ }
        // if (values.delivery_area_keys) {
        //   let gps_list_data = values.delivery_area_keys.map(key => values.self_delivery_info[key])
        //   gps_list_data.forEach((element, i) => {
        //     values.self_delivery_info[i].gps_list = this.state.self_delivery_info_gps_list[i];
        //   });
        //   values.self_delivery_info = JSON.stringify(values.self_delivery_info);
        // } else {
        //   message.error('请在商家自配地图中选取配送区域');
        //   delete values.self_delivery_info;
        //   return false
        // }

      }

      // 金额转字符串，以及处理金额修改为美分
      values.min_consume = '' + (values.min_consume * 100);

      if (values.percent_platform) {
        values.percent_platform = '' + (values.percent_platform);
        values.min_order_web_amount_platform = '' + (values.min_order_web_amount_platform * 100);
      }

      if (values.percent_take) {
        values.percent_take = '' + (values.percent_take);
        values.min_order_web_amount_take = '' + (values.min_order_web_amount_take * 100);
      }

      if (values.percent_self) {
        values.percent_self = '' + (values.percent_self);
        values.min_order_web_amount_self = '' + (values.min_order_web_amount_self * 100);
      }

      // 删除多余的提交字段
      if (values.delivery_area_radius0) {
        delete values.delivery_area_radius0;
      }
      values.open_schedule_keys && (delete values.open_schedule_keys)
      values.delivery_area_keys && (delete values.delivery_area_keys)
      values.plat_delivery_area_radius && (delete values.plat_delivery_area_radius)

      console.log('提交前的数据', values);

      if (!err) {
        // 提醒确认
        Modal.confirm({
          title: '温馨提示',
          content: '确认资料已全部正确填写。',
          onOk: () => {
            this.postForm(values);
          },
          onCancel () {
            return;
          },
        });
      } else {
        message.error('表单尚未填写完，请检查。');
      }

    });

  }
  postForm = values => {
    const { dispatch, form } = this.props;
    const { merchant_id, platform_gps_list } = this.state;
    const { open_schedule, open_schedule_keys, delivery_area_key_num, delivery_type } = values;

    console.log('postForm', values);

    let formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, values[key] || '');
    });

    // 提交坐标前要调换一下位置

    // // 新增必要的字段
    formData.append('merchant_id', merchant_id);
    if (platform_gps_list && platform_gps_list.length > 0) {
      formData.append('platform_gps_list', JSON.stringify(platform_gps_list));
    }

    console.log('platform_gps_list', formData.getAll('platform_gps_list'));
    console.log('self_delivery_info', formData.getAll('self_delivery_info'));

    console.log('postForm最终字段', values);

    // // 提交表单
    dispatch({
      type: 'mdish/fetchSaveMuserShopInfo',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        // message.success('保存成功')
        message.success('保存成功', 0.5, () => {
          location.reload();
        });
      },
    });


  }



  onDTOChange = (checkedValues) => {
    const { form } = this.props;
    // console.log(checkedValues, form.getFieldValue('delivery_type'));
    if (checkedValues.indexOf('2') != -1) {
      if (form.getFieldValue('delivery_type').indexOf('2') == -1) {
        checkedValues.push('1');
        form.setFieldsValue({
          delivery_type: checkedValues,
        })
      }
    }
  }

  // tab切换的点击事件
  onTabbox = (aKey) => {
    const { form } = this.props;
    const { shopGps, platform_gps_list, sys_city_gps_list, self_delivery_info } = this.state;
    const { getFieldDecorator, getFieldValue } = form;

    this.setState({ activeKey: aKey }, () => {
      if (this.state.activeKey == 1 && aKey == 1) {
        this.initMap('platformMap', shopGps, platform_gps_list, form.getFieldValue('plat_delivery_area_radius'));
      }
      if (this.state.activeKey == 2 && aKey == 2) {
        this.initMap('cityMap', shopGps, sys_city_gps_list);
      }
      if (this.state.activeKey == 3 && aKey == 3) {
        let allGpsArr = []
        const dataList = self_delivery_info
        // console.log('dataList', dataList)
        if (dataList && dataList.length > 0 && dataList[0].gps_list) {
          // console.log('显示的地图', dataList[0].gps_list)
          this.initMap('selfMap0', shopGps, dataList[0].gps_list, getFieldValue(`delivery_area_radius0`));
        } else {
          this.initMap('selfMap0', shopGps, [], getFieldValue(`delivery_area_radius0`));
        }

        {/* 单个配送区域 */ }
        // const deliLen = delivery_area_list_key.length
        // if (deliLen > 0) {
        //   console.log('delivery_area_list_key123', deliLen);
        //   // 拿到数据地图的坐标
        //   let allGpsArr = []
        //   const dataList = this.state.self_delivery_info
        //   dataList.forEach((el, i) => {
        //     allGpsArr.push(el.gps_list)
        //   });
        //   for (let i = 0; i < deliLen; i++) {
        //     // console.log('iii12', i)
        //     this.initMap(`selfMap0`, this.state.shopGps, allGpsArr[i], this.state.delivery_area_radius);
        //   }
        // }


      }
    }
    );
  }


  // 地图画圆的方法
  createGeoJSONCircle = (center, radiusInKm, points) => {
    if (!points) points = 64;

    let coords = {
      latitude: center[1],
      longitude: center[0]
    };

    let km = radiusInKm;

    let ret = [];
    let distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    let distanceY = km / 110.574;

    let theta, x, y;
    for (let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);

      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [ret]
          }
        }]
      }
    };
  };

  changeDeliveryAreaRadius = (name, k, area_radiu) => {
    const { form: { getFieldValue } } = this.props
    const { shopGps, platform_gps_list, self_delivery_info } = this.state;
    // console.log('重置圆，获取门店中心', k);
    if (name == 'platformMap') {
      this.initMap('platformMap', shopGps, platform_gps_list, area_radiu);
    }
    if (name == 'selfMap') {
      const dataList = self_delivery_info

      if (dataList && dataList[0].gps_list) {
        this.initMap('selfMap0', shopGps, dataList[0].gps_list, getFieldValue(`delivery_area_radius0`));
      } else {
        this.initMap('selfMap0', shopGps, [], getFieldValue(`delivery_area_radius0`));
      }

    }

  }


  updateArea (e, draw, name, key, typeName) {
    var data = draw.getAll();
    var arr1 = []
    if (data.features.length > 0) {
      // console.log('最后坐标', data)
      var arr = data.features[data.features.length - 1].geometry.coordinates[0];
      arr.forEach((item) => {
        // console.log(item)
        var arrData = {};
        arrData.lon = item[0];
        arrData.lat = item[1];
        arr1.push(arrData)
      })
    }


    if (name == 'platformMap') {
      if (typeName == 'delete') {
        this.setState({
          platform_gps_list: []
        })
      }
      if (arr1.length != 0) {
        this.setState({
          platform_gps_list: [...arr1]
        }, () => {
          console.log('要提交的地图坐标 platformMap', this.state.platform_gps_list);
        })
      }
    }

    if (name == 'selfMap') {
      if (typeName == 'delete') {
        this.setState({
          self_delivery_info_gps_list: []
        })
      }
      if (data.features.length != 0) {
        this.setState({
          self_delivery_info_gps_list: [...arr1]
        }, () => {
          console.log('要提交的地图坐标 selfMap', this.state.self_delivery_info_gps_list);
        })
      }
      //  else {
      //   message.error('请在商家自配地图中选取配送区域');
      //   return false
      // }


      {/* 单个配送区域 */ }

      // console.log('key1', key);
      // const lastData = []

      // if (post_delivery_area_list.hasOwnProperty(key)) {
      //   post_delivery_area_list.forEach((el, i) => {
      //     if (i == key) {
      //       el = data;
      //     }
      //   });
      // } else {
      //   post_delivery_area_list.push(data)
      // }

      // const iData = post_delivery_area_list

      // if (iData.length >= 0) {
      //   iData.forEach((el, i) => {
      //     if (el.features.length > 1) {
      //       const arr = el.features[el.features.length - 1].geometry.coordinates[0];
      //       const addKeyArr = []
      //       if (arr) {
      //         // console.log('产生数据2', arr)
      //         arr.forEach((item) => {
      //           const arrData = {};
      //           arrData.lon = item[0];
      //           arrData.lat = item[1];
      //           addKeyArr.push(arrData)
      //         })
      //         lastData.push(addKeyArr)
      //       }
      //     }
      //   })
      // }

      // if (lastData.length == iData.length) {
      //   this.setState({
      //     self_delivery_info_gps_list: lastData
      //   }, () => {
      //     console.log('要提交的地图坐标selfMap state', this.state.self_delivery_info_gps_list);
      //     // console.log('要提交的地图坐标selfMap', post_delivery_area_list, 'last:', lastData);
      //   })
      // }
    }

  }

  //   地图初始化  
  /**
   * containerID map div 容器的id
   *  gpsListData 地图坐标多边形
   * shopGPS 店铺的门店中心坐标
   * centerName  center的坐标
   * resultData 最后的data数据
   * , centerName, resultData
   */
  initMap = (containerID, shopGPS, gpsListData, radius) => {
    const { platform_gps_list, gps, shopGps, delivery_area_key_map } = this.state;
    let centerName = [0, 0];
    let resultData = {};
    shopGPS = shopGps;
    radius = radius ? radius : 3
    const deliLen = delivery_area_list_key.length
    console.log('门店中心banjing', containerID, shopGPS, gpsListData, radius);

    // __________________________map__resultData______________________________ //

    if (gpsListData && gpsListData.length > 0 && typeof (gpsListData) !== null && gpsListData.length != 0) {
      if (containerID == 'platformMap' || containerID == 'selfMap0') {
        var arr1 = [];
        var arr2 = [];
        gpsListData.forEach(item => {
          var arr = [];
          arr.push(Number(item.lon));
          arr.push(Number(item.lat));
          arr1.push(arr);
        });

        let center_data = arr1
        arr2.push(arr1);
        center_data.forEach((el, i) => {
          if (i == parseInt(center_data.length / 2)) {
            centerName = el;
          }
        });
        resultData = {
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
      }

      // 全城送 _map__resultData
      if (containerID == 'cityMap') {
        // console.log('cityMap', gpsListData)
        var arr1 = [];
        var arr2 = [];
        gpsListData.forEach(item => {
          var arr = [];
          arr.push(Number(item.lon));
          arr.push(Number(item.lat));
          arr1.push(arr);
        });
        let center_data = arr1
        arr2.push(arr1);
        resultData = {
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
        center_data.forEach((el, i) => {
          if (i == parseInt(center_data.length / 2)) {
            centerName = el;
          }
        });
      }

      // 商家自配  _map__resultData
      {/* 单个配送区域 */ }
      // if (deliLen >= 0) {
      //   // console.log('多个地图的数据', gpsListData)
      //   // console.log('deliLen', deliLen);
      //   for (var i = 0; i < deliLen; i++) {
      //     if (containerID == `selfMap${i}`) {
      //       var arr1 = [];
      //       var arr2 = [];
      //       gpsListData.forEach(item => {
      //         var arr = [];
      //         arr.push(Number(item.lon));
      //         arr.push(Number(item.lat));
      //         arr1.push(arr);
      //       });

      //       let center_data = arr1
      //       arr2.push(arr1);
      //       center_data.forEach((el, i) => {
      //         if (i == parseInt(center_data.length / 2)) {
      //           centerName = el;
      //         }
      //       });
      //       resultData = {
      //         type: 'FeatureCollection',
      //         features: [
      //           {
      //             type: 'Feature',
      //             properties: {},
      //             geometry: {
      //               type: 'Polygon',
      //               coordinates: arr2,
      //             },
      //           },
      //         ],
      //       };
      //     }

      //   }

      // }


    } else {
      // 如果没有传入gpsListData，使用默认的中心点
      centerName = shopGPS
    }

    // console.log('centerName', centerName)
    // __________________________new map________________________________ //
    mapboxgl.accessToken = configVar.mapConfig.accessToken;
    const map = new mapboxgl.Map({
      container: containerID,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: centerName,
      zoom: 13,
    });
    // map.on('load', () => {
    //   utils.onMapStyleLoad(map);
    // });

    // __________________________ map.on________________________________ //

    // 平台专送  map.on
    if (containerID == 'platformMap') {
      // console.log('>>>>>', shopGPS, radius)
      const isNullObj = (JSON.stringify(resultData) == "{}");
      // 门店坐标
      map.flyTo({ center: shopGPS });
      const marker = new mapboxgl.Marker({}).setLngLat(shopGPS).addTo(map);
      map.on('load', () => {
        // 地图画圈
        map.addSource("polygon", this.createGeoJSONCircle(shopGPS, radius));
        map.addLayer({
          "id": "polygon",
          "type": "fill",
          "source": "polygon",
          "layout": {},
          "paint": {
            "fill-color": "blue",
            "fill-opacity": 0.5
          }
        });

        // 选择多个坐标
        var draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          userProperties: true,
          styles: [
            {
              "id": "gl-draw-polygon-fill",
              "type": "fill",
              "paint": {
                "fill-color": "#F9B531",
                "fill-outline-color": "#F9B531",
                "fill-opacity": 0.4
              }
            },
            {
              "id": "gl-draw-polygon-stroke-active",
              "type": "line",
              "layout": {
                "line-cap": "round",
                "line-join": "round"
              },
              "paint": {
                "line-color": "#F9B531",
                "line-width": 2
              }
            },
            {
              "id": "gl-draw-polygon-and-line-vertex-active",
              "type": "circle",
              "paint": {
                "circle-radius": 3,
                "circle-color": "#F9B531",
              }
            }
          ]
        });
        map.addControl(draw);
        map.on('draw.create', (e) => { this.updateArea(e, draw, 'platformMap') });
        map.on('draw.delete', (e) => { this.updateArea(e, draw, 'platformMap', '', 'delete') });
        map.on('draw.update', (e) => { this.updateArea(e, draw, 'platformMap') });

        // 地图多边形描点
        if (!isNullObj) {
          draw.add(resultData);  //获取已得到的商圈 // 选择多个坐标
        }
      });

    }



    // 全城送  map.on
    if (containerID == 'cityMap') {
      map.on('load', function () {
        map.addLayer({
          id: 'maine',
          type: 'fill',
          source: {
            type: 'geojson',
            data: resultData,
          },
          layout: {},
          paint: {
            'fill-color': '#FF9800',
            'fill-opacity': 0.5,
          },
        });
      });
    }


    if (containerID == 'selfMap0') {
      const isNullObj = (JSON.stringify(resultData) == "{}");
      // 门店坐标
      map.flyTo({ center: shopGPS });
      const marker = new mapboxgl.Marker({}).setLngLat(shopGPS).addTo(map);
      map.on('load', () => {
        // 地图画圈
        map.addSource("polygon", this.createGeoJSONCircle(shopGPS, radius));
        map.addLayer({
          "id": "polygon",
          "type": "fill",
          "source": "polygon",
          "layout": {},
          "paint": {
            "fill-color": "blue",
            "fill-opacity": 0.5
          }
        });

        // 选择多个坐标
        var draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          userProperties: true,
          styles: [
            {
              "id": "gl-draw-polygon-fill",
              "type": "fill",
              "paint": {
                "fill-color": "#F9B531",
                "fill-outline-color": "#F9B531",
                "fill-opacity": 0.4
              }
            },
            {
              "id": "gl-draw-polygon-stroke-active",
              "type": "line",
              "layout": {
                "line-cap": "round",
                "line-join": "round"
              },
              "paint": {
                "line-color": "#F9B531",
                "line-width": 2
              }
            },
            {
              "id": "gl-draw-polygon-and-line-vertex-active",
              "type": "circle",
              "paint": {
                "circle-radius": 3,
                "circle-color": "#F9B531",
              }
            }
          ]
        });
        map.addControl(draw);
        map.on('draw.create', (e) => { this.updateArea(e, draw, 'selfMap') });
        map.on('draw.delete', (e) => { this.updateArea(e, draw, 'selfMap', '', 'delete') });
        map.on('draw.update', (e) => { this.updateArea(e, draw, 'selfMap') });

        // 地图多边形描点
        if (!isNullObj) {
          draw.add(resultData);  //获取已得到的商圈 // 选择多个坐标
        }
      });

    }

    {/* 单个配送区域 */ }
    // 商家自配  map.on
    // if (deliLen >= 0) {
    //   console.log('deliLen', deliLen)
    //   for (let j = 0; j < deliLen; j++) {
    //     console.log('jj123', j)
    //     if (containerID == `selfMap${j}`) {
    //       const isNullObj = (JSON.stringify(resultData) == "{}");
    //       // 门店坐标
    //       map.flyTo({ center: shopGPS });
    //       const marker = new mapboxgl.Marker({}).setLngLat(shopGPS).addTo(map);
    //       map.on('load', () => {
    //         // 地图画圈
    //         map.addSource("polygon", this.createGeoJSONCircle(shopGPS, radius));
    //         map.addLayer({
    //           "id": "polygon",
    //           "type": "fill",
    //           "source": "polygon",
    //           "layout": {},
    //           "paint": {
    //             "fill-color": "blue",
    //             "fill-opacity": 0.5
    //           }
    //         });

    //         // 选择多个坐标
    //         var draw = new MapboxDraw({
    //           displayControlsDefault: false,
    //           controls: {
    //             polygon: true,
    //             trash: true
    //           },
    //         });
    //         map.addControl(draw);
    //         map.on('draw.create', (e) => { this.updateArea(e, draw, `selfMap`, j) });
    //         map.on('draw.delete', (e) => { this.updateArea(e, draw, `selfMap`, j) });
    //         map.on('draw.update', (e) => { this.updateArea(e, draw, `selfMap`, j) });



    //         // 地图多边形描点
    //         if (!isNullObj) {
    //           // 将坐标画至地图
    //           // console.log('zuobiaod', resultData);
    //           draw.add(resultData);
    //           //获取已得到的商圈 // 选择多个坐标
    //         }
    //       });
    //     }

    //   }

    // }

  };



  // renderDeliveryArea () {
  //   const { form, common } = this.props;
  //   const { getFieldDecorator, getFieldValue } = form;
  //   const { verify_status, verify_fail_message, delivery_area_key_map } = this.state
  //   const formLayout_tab = {
  //     labelCol: { span: 3 },
  //     wrapperCol: { span: 21 },
  //   };
  //   // 配送区域添加多项事件
  //   const removeDeliveryArea = k => {
  //     const keys = form.getFieldValue('delivery_area_keys');
  //     if (keys.length === 0) {
  //       return;
  //     }
  //     form.setFieldsValue({
  //       delivery_area_keys: keys.filter(key => key !== k),
  //     });
  //   }


  //   const addDeliveryArea = () => {
  //     // this.initMap(`selfMap${this.state.delivery_area_list_key}`, this.state.shopGps, this.state.self_delivery_info_gps_list, this.state.delivery_area_radius);
  //     const delivery_area_keys = form.getFieldValue('delivery_area_keys');
  //     delivery_area_key_num = delivery_area_list_key.length > 0 ? delivery_area_list_key.length : delivery_area_key_num
  //     const nextKeys = delivery_area_keys.concat(delivery_area_key_num++);
  //     form.setFieldsValue({
  //       delivery_area_keys: nextKeys,
  //     });
  //     console.log('执行地图')
  //     this.initMap(`selfMap${delivery_area_key_num}`, this.state.shopGps);
  //   }
  //   form.getFieldDecorator('delivery_area_keys', { initialValue: delivery_area_list_key.length > 0 ? delivery_area_list_key : [0] });
  //   const delivery_area_keys = form.getFieldValue('delivery_area_keys');
  //   const deliveryAreaList = delivery_area_keys.map((k, index) => (
  //     < FormItem
  //       {...formLayout_tab}
  //       key={k}
  //       label={`配送区域${index + 1}`}
  //     >
  //       <div className="form-col-box" style={{ position: 'relation' }}>
  //         <div className="delivery-map-wrap">
  //           <div id={`selfMap${k}`} style={{ width: '100%', height: 430, marginTop: 20, marginBottom: 20 }} className="map_box delivery-map" ref="mapBox" />
  //           <div className="delivery-txt-wrap">
  //             参考范围：以门店为中心半径
  //                       {getFieldDecorator(`delivery_area_radius${k}`, { initialValue: 3 })(<Input className="delivery-input" />)}
  //             公里
  //                       <Button type="primary" size="small" style={{ marginLeft: 10 }} onClick={() => { this.changeDeliveryAreaRadius('selfMap', k, getFieldValue(`delivery_area_radius${k}`)) }}>显示</Button>
  //           </div>
  //         </div>
  //         <Form.Item {...formLayout_tab} label="配送费">
  //           <Form.Item {...formLayout_tab} label="配送费">
  //             {getFieldDecorator(`self_delivery_info[${k}].delivery_price`, {
  //               rules: [{ required: true, message: '请输入正确的金额数字', pattern: moneyReg }],
  //               getValueFromEvent: (event) => {
  //                 return event.target.value.replace(moneyKtReg, '$1')
  //               },
  //             })(<Input addonBefore="$" placeholder="请输入" allowClear style={{ width: 150 }} />)}
  //           </Form.Item>
  //           <FormItem {...formLayout_tab} label="配送时间">
  //             {getFieldDecorator(`self_delivery_info[${k}].delivery_time`, {
  //               rules: [{ required: true, message: '必须输入纯数字', pattern: timeReg }],
  //               getValueFromEvent: (event) => {
  //                 return event.target.value.replace(/\D/g, '')
  //               },
  //             })(<Input placeholder="请输入" allowClear addonAfter="分钟" style={{ width: 150 }} />)}
  //           </FormItem>
  //         </Form.Item>
  //         {index === 0 ? (<span className="ant-form-text" style={{ position: 'absolute', top: '0', right: '0' }}>
  //           <a onClick={addDeliveryArea}>添加配送区域</a>
  //         </span>) : (<span className="ant-form-text" style={{ position: 'absolute', top: '0', right: '0' }}>
  //           <a onClick={() => removeDeliveryArea(k)}>删除</a>
  //         </span>)}
  //       </div>

  //     </ FormItem>

  //   ));

  //   return deliveryAreaList

  // }

  renderOpenSchedule () {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 6 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 6, offset: 3 },
    };
    // console.log('render open_schedule_tmp', open_schedule_tmp);
    // 营业时间段添加多项事件
    const removeOpenSchedule = k => {
      const keys = form.getFieldValue('open_schedule_keys');
      if (keys.length === 0) {
        return;
      }
      form.setFieldsValue({
        open_schedule_keys: keys.filter(key => key !== k),
      });
    }
    const addOpenSchedule = () => {
      open_schedule_tmp = []//清空赋值
      const open_schedule_keys = form.getFieldValue('open_schedule_keys');
      const nextKeys = open_schedule_keys.concat(open_schedule_key_num++);
      form.setFieldsValue({
        open_schedule_keys: nextKeys,
      });
    }
    form.getFieldDecorator('open_schedule_keys', { initialValue: [0] });
    const open_schedule_keys = form.getFieldValue('open_schedule_keys');
    const openScheduleList = open_schedule_keys.map((k, index) => (
      <FormItem
        {...(index === 0 ? formLayout : formLayoutWithOutLabel)}
        label={index === 0 ? '营业时间' : ''}
        key={k}
        extra={index === 0 ? "必填。温馨提示：结束时间必须大于开始时间，不可以交叉设置时间" : ''}
      >
        {open_schedule_tmp.length > 0 ? (<div className="clearfix" style={{ display: 'inline-block', width: '100%' }}>
          <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
            {form.getFieldDecorator(`open_schedule[${k}][os_startTime]`, {
              rules: [{ required: true, message: '必填' }], initialValue: moment(open_schedule_tmp[k] && open_schedule_tmp[k].os_startTime, 'HH:mm')
            })(<TimePicker format={format} style={{ width: '100%' }} />)}
          </Form.Item>

          <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
          <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
            {form.getFieldDecorator(`open_schedule[${k}][os_endTime]`, {
              rules: [{ required: true, message: '必填' }], initialValue: moment(open_schedule_tmp[k] && open_schedule_tmp[k].os_endTime, 'HH:mm')
            })(<TimePicker format={format} style={{ width: '100%' }} />)}
          </Form.Item>
        </div>) : (<div className="clearfix" style={{ display: 'inline-block', width: '100%' }}>
          <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
            {form.getFieldDecorator(`open_schedule[${k}][os_startTime]`, {
              rules: [{ required: true, message: '必填' }]
            })(<TimePicker format={format} style={{ width: '100%' }} />)}
          </Form.Item>

          <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
          <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
            {form.getFieldDecorator(`open_schedule[${k}][os_endTime]`, {
              rules: [{ required: true, message: '必填' }]
            })(<TimePicker format={format} style={{ width: '100%' }} />)}
          </Form.Item>
        </div>)}

        {index === 0 ? (<span className="ant-form-text" style={{ position: 'absolute', right: '-90px' }}>
          <a onClick={addOpenSchedule}>+ 添加时段</a>
        </span>) : (<span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
          <a onClick={() => removeOpenSchedule(k)}>删除</a>
        </span>)}

      </FormItem>
    ));


    return openScheduleList
  }

  render () {
    const { form, common } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { infoData } = this.state
    // console.log('infoData', infoData)

    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 6 },
    };
    const formLayout_two = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const formLayout_half = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };
    const formLayout_tab = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 6, offset: 3 },
    };



    return (
      <Card bordered={false} >
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
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="周营业日">
            {getFieldDecorator('open_weeks', {
              rules: [{ required: true, message: '必填' }],
            })(
              <Checkbox.Group style={{ width: 560 }}>
                <Checkbox value="0">周一</Checkbox>
                <Checkbox value="1">周二</Checkbox>
                <Checkbox value="2">周三</Checkbox>
                <Checkbox value="3">周四</Checkbox>
                <Checkbox value="4">周五</Checkbox>
                <Checkbox value="5">周六</Checkbox>
                <Checkbox value="6">周日</Checkbox>
              </Checkbox.Group>
            )}
          </FormItem>
          {/* 营业时段 */}
          {this.renderOpenSchedule()}
          {/* end营业时段 */}
          <FormItem {...formLayout} label="是否支持上门自提">
            {getFieldDecorator('is_allow_self_pick', { rules: [{ required: true, message: '请选择' }], initialValue: infoData.is_allow_self_pick })(
              <Radio.Group>
                <Radio value={1}>支持</Radio>
                <Radio value={2}>不支持</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="备货时间">
            {getFieldDecorator('meal_time', {
              rules: [{ message: '必须输入纯数字', pattern: timeReg }],
              getValueFromEvent: (event) => {
                return event.target.value.replace(/\D/g, '')
              },
            })(<Input placeholder="请输入" allowClear addonAfter="分钟" style={{ width: 150 }} />)}
          </FormItem>
          <FormItem {...formLayout} label="预订单时间范围">
            {getFieldDecorator('book_time', { rules: [{ required: true, message: '请选择' }], initialValue: infoData.book_time })(<Select placeholder="请选择" style={{ width: 150 }}>
              <Option value={-1}>不支持</Option>
              <Option value={1}>当天</Option>
              <Option value={2}>明天</Option>
              <Option value={3}>后天</Option>
            </Select>)}
          </FormItem>
          <FormItem {...formLayout} label="预订单提醒时间">
            {getFieldDecorator('book_reminder_time', { initialValue: infoData.book_reminder_time })(
              <Checkbox.Group style={{ width: 560 }}>
                <Checkbox value="1800">30分钟</Checkbox>
                <Checkbox value="2700">45分钟</Checkbox>
                <Checkbox value="4500">1小时15分</Checkbox>
                <Checkbox value="5400">1小时30分</Checkbox>
                <Checkbox value="6300">1小时45分</Checkbox>
                <Checkbox value="7200">2小时</Checkbox>
              </Checkbox.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="休息期间支持预定">
            {getFieldDecorator('book_rest', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: infoData.book_rest
            })(
              <Radio.Group>
                <Radio value={1}>支持</Radio>
                <Radio value={2}>不支持</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <Row>
            <Col span={3} className="col-label"><span>商家公告：</span></Col>
            <Col span={8}>
              <div className="form-col-box">
                <FormItem {...formLayout_two} label="中文公告">
                  {getFieldDecorator('announcement_cn', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input.TextArea placeholder="请输入中文公告（100字以内）" rows={4} maxLength={100} />)}
                  <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
                    <a onClick={() => { utils.translator(form, 'announcement') }}>翻译</a>
                  </span>
                </FormItem>
                <FormItem {...formLayout_two} label="英文公告">
                  {getFieldDecorator('announcement_en', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input.TextArea placeholder="请输入英文公告（100字以内）" rows={4} />)}
                </FormItem>
                <FormItem {...formLayout_two} label="柬文公告">
                  {getFieldDecorator('announcement_kh', {
                    rules: [{ required: true, message: '必填' }],
                  })(<Input.TextArea placeholder="请输入柬文公告（100字以内）" rows={4} />)}
                </FormItem>
              </div>
            </Col>
          </Row>
          <Form.Item {...formLayout} label="起送金额">
            {getFieldDecorator('min_consume', {
              rules: [{ required: true, message: '请输入正确的金额数字', pattern: moneyReg }],
              getValueFromEvent: (event) => {
                return event.target.value.replace(moneyKtReg, '$1')
              }
            })(<Input addonBefore="$" placeholder="请输入" allowClear style={{ width: 120 }} />)}
          </Form.Item>
          <h3 className="title_hd m-t-30">配送信息</h3>
          <FormItem {...formLayout} label="配送类型">
            {getFieldDecorator('delivery_type', {
              rules: [{ required: true, message: '必填' }],
              initialValue: ['1', '2', '3'],
            })(
              <Checkbox.Group style={{ width: 560 }} onChange={this.onDTOChange}>
                <Checkbox value="1">平台专送</Checkbox>
                <Checkbox value="2">平台全城送</Checkbox>
                <Checkbox value="3">商家自配送</Checkbox>
              </Checkbox.Group>
            )}
          </FormItem>
          <Row>
            <Col span={3} className="col-label"><span>配送设置：</span></Col>
            <Col span={12}>
              <Tabs onChange={val => this.onTabbox(val)} type="card">
                {getFieldValue('delivery_type').indexOf("1") == -1 ? undefined : (<TabPane tab="平台专送" key="1" >
                  <FormItem {...formLayout_tab} label="配送区域">
                    <div className="delivery-map-wrap">
                      <div id="platformMap" className="map_box delivery-map" ref="mapBox" />
                      <div className="delivery-txt-wrap">
                        参考范围：以门店为中心半径
                        {getFieldDecorator('plat_delivery_area_radius', { initialValue: 3 })(<Input className="delivery-input" />)}
                        公里
                        <Button type="primary" size="small" style={{ marginLeft: 10 }} onClick={() => { this.changeDeliveryAreaRadius('platformMap', '', getFieldValue('plat_delivery_area_radius')) }}>显示</Button>
                      </div>
                    </div>
                  </FormItem>
                  <Form.Item {...formLayout_tab} label="配送费">
                    <Input addonBefore="$" value={this.state.basic_delivery_price / 100} disabled style={{ width: 120 }} />
                  </Form.Item> </TabPane>
                )}
                {getFieldValue('delivery_type').indexOf("2") == -1 ? undefined : (<TabPane tab="全城送" key="2" >
                  <FormItem {...formLayout_tab} label="配送区域">
                    {/* <div>地图</div> */}
                    <div id="cityMap" className="map_box" style={{ width: '100%', height: 430 }} ref="mapBox" />
                  </FormItem>
                  <FormItem {...formLayout_tab} label="配送城市">
                    <div>{infoData.city_name}</div>
                  </FormItem>
                  <Form.Item {...formLayout_tab} label="基础配送费">
                    <Input addonBefore="$" defaultValue={this.state.basic_delivery_price / 100} disabled style={{ width: 120 }} />
                  </Form.Item>
                  <FormItem {...formLayout_tab} label="距离附加费">

                    {this.state.distance_append_price ? (this.state.distance_append_price.map((items, i) => (
                      <Row key={i}>
                        {this.state.distance_append_price[i].start_distance == undefined ? (<Col span={10}>
                          <Row>
                            <Col span={11}>
                              <FormItem  {...formLayout_half} label=""><Input disabled defaultValue={this.state.distance_append_price[i].end_distance} addonAfter="Km" style={{ width: 120 }} />
                              </FormItem></Col>
                            <Col><span>以上</span></Col>
                          </Row>
                        </Col>
                        ) : (<Col span={10}>
                          <Row>
                            <Col span={11}>
                              <FormItem  {...formLayout_half} ><Input disabled addonAfter="Km" defaultValue={this.state.distance_append_price[i].start_distance} style={{ width: 120 }} />
                              </FormItem>
                            </Col>
                            <Col span={2}>至</Col>
                            <Col span={11}>
                              <FormItem  {...formLayout_half}><Input disabled addonAfter="Km" defaultValue={this.state.distance_append_price[i].end_distance} style={{ width: 120 }} /></FormItem></Col>
                          </Row>
                        </Col>
                          )}
                        <Col span={10}>
                          <FormItem  {...formLayout_half} label="每km加">
                            <Input addonBefore="$" defaultValue={this.state.distance_append_price[i].price / 100} disabled style={{ width: 120 }} />
                          </FormItem>
                        </Col>
                      </Row>

                    ))) : undefined

                    }

                  </FormItem>
                </TabPane>
                )}
                {getFieldValue('delivery_type').indexOf("3") == -1 ? undefined : (<TabPane tab="商家自配送" key="3" >
                  {/* {this.renderDeliveryArea()} */}
                  {/* 单个配送区域 */}
                  < FormItem
                    {...formLayout_tab}
                    label={`配送区域`}
                  >
                    <div className="form-col-box" style={{ position: 'relation' }}>
                      <div className="delivery-map-wrap">
                        <div id="selfMap0" style={{ width: '100%', height: 430, marginTop: 20, marginBottom: 20 }} className="map_box delivery-map" ref="mapBox" />
                        <div className="delivery-txt-wrap">
                          参考范围：以门店为中心半径
                        {getFieldDecorator(`delivery_area_radius0`, { initialValue: 3 })(<Input className="delivery-input" />)}
                          公里
                        <Button type="primary" size="small" style={{ marginLeft: 10 }} onClick={() => { this.changeDeliveryAreaRadius('selfMap', '', getFieldValue(`delivery_area_radius0`)) }}>显示</Button>
                        </div>
                      </div>
                      <Form.Item {...formLayout_tab} label="配送费">
                        <Form.Item {...formLayout_tab} label="配送费">
                          {getFieldDecorator(`self_delivery_info[0].delivery_price`, {
                            rules: [{ required: true, message: '请输入正确的金额数字', pattern: moneyReg }],
                            getValueFromEvent: (event) => {
                              return event.target.value.replace(moneyKtReg, '$1')
                            },
                          })(<Input addonBefore="$" placeholder="请输入" allowClear style={{ width: 150 }} />)}
                        </Form.Item>
                        <FormItem {...formLayout_tab} label="配送时间">
                          {getFieldDecorator(`self_delivery_info[0].delivery_time`, {
                            rules: [{ required: true, message: '必须输入纯数字', pattern: timeReg }],
                            getValueFromEvent: (event) => {
                              return event.target.value.replace(/\D/g, '')
                            },
                          })(<Input placeholder="请输入" allowClear addonAfter="分钟" style={{ width: 150 }} />)}
                        </FormItem>
                      </Form.Item>
                    </div>

                  </ FormItem>
                  {/* 单个配送区域 */}
                </TabPane>
                )}
              </Tabs>
            </Col>
          </Row>
          <Row>
            <Col span={3} className="col-label"> <span>平台佣金抽成：</span></Col>
            <Col span={12}>
              <div className="form-col-box">
                {getFieldValue('delivery_type').indexOf("1") == -1 ? undefined : (<Row>
                  <Col span={12}>
                    <FormItem  {...formLayout_half} label="平台专送佣金比例">
                      {getFieldDecorator('percent_platform', {
                        rules: [{ required: true, message: '请输入正确的比例', pattern: moneyReg }],
                        getValueFromEvent: (event) => {
                          return event.target.value.replace(moneyKtReg, '$1')
                        },
                      })(<Input placeholder="请输入" addonAfter="%" style={{ width: 120 }} />)}
                    </FormItem></Col>
                  <Col span={12}>
                    <FormItem  {...formLayout_half} label="保底抽成">
                      {getFieldDecorator('min_order_web_amount_platform', {
                        rules: [{ required: true, message: '请输入正确的金额数字', pattern: moneyReg }],
                        getValueFromEvent: (event) => {
                          return event.target.value.replace(moneyKtReg, '$1')
                        },
                      })(<Input addonBefore="$" placeholder="请输入" allowClear style={{ width: 120 }} />)}
                    </FormItem>
                  </Col>
                </Row>
                )}
                {getFieldValue('delivery_type').indexOf("3") == -1 ? undefined : (<Row><Col span={12}>
                  <FormItem  {...formLayout_half} label="商家自配送佣金比例">
                    {getFieldDecorator('percent_self', {
                      rules: [{ required: true, message: '请输入正确的比例', pattern: moneyReg }],
                      getValueFromEvent: (event) => {
                        return event.target.value.replace(moneyKtReg, '$1')
                      },
                    })(<Input placeholder="请输入" addonAfter="%" style={{ width: 120 }} />)}
                  </FormItem></Col>
                  <Col span={12}>
                    <FormItem  {...formLayout_half} label="保底抽成">
                      {getFieldDecorator('min_order_web_amount_self', {
                        rules: [{ required: true, message: '请输入正确的金额数字', pattern: moneyReg }],
                        getValueFromEvent: (event) => {
                          return event.target.value.replace(moneyKtReg, '$1')
                        },
                      })(<Input addonBefore="$" placeholder="请输入" allowClear style={{ width: 120 }} />)}
                    </FormItem>
                  </Col>
                </Row>)}
                {getFieldValue('is_allow_self_pick') == 2 || getFieldValue('is_allow_self_pick') == 2 && getFieldValue('delivery_type').indexOf("2") == -1 || getFieldValue('is_allow_self_pick') == 2 && getFieldValue('delivery_type').indexOf("3") == -1 ? undefined : (<Row>
                  <Col span={12}>
                    <FormItem  {...formLayout_half} label="上门自提佣金比例">
                      {getFieldDecorator('percent_take', {
                        rules: [{ required: true, message: '请输入正确的比例', pattern: moneyReg }],
                        getValueFromEvent: (event) => {
                          return event.target.value.replace(moneyKtReg, '$1')
                        },
                      })(<Input placeholder="请输入" addonAfter="%" style={{ width: 120 }} />)}
                    </FormItem></Col>
                  <Col span={12}>
                    <FormItem  {...formLayout_half} label="保底抽成">
                      {getFieldDecorator('min_order_web_amount_take', {
                        rules: [{ required: true, message: '请输入正确的金额数字', pattern: moneyReg }],
                        getValueFromEvent: (event) => {
                          return event.target.value.replace(moneyKtReg, '$1')
                        },
                      })(<Input addonBefore="$" placeholder="请输入" allowClear style={{ width: 120 }} />)}
                    </FormItem>
                  </Col>
                </Row>)}
              </div>
            </Col>
          </Row>
          {infoData.verify_status == 1 ? undefined : (<FormItem {...formLayoutWithOutLabel}><Button type="primary" htmlType="submit">保存</Button> <Button style={{ marginLeft: 8 }} onClick={goBack}>取消</Button></FormItem>)}
        </Form>
      </Card >
    )
  }
}

export default ShopConfiguration;
