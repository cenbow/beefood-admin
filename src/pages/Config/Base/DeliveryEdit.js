import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, message } from 'antd';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import styles from '../Config.less';
import { getCityInfo } from '@/services/business';


const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
let key_num = 1;
let map;
let Draw;
let gps_list_data = [];

@connect(({ common, configDelivery, loading }) => ({
  common,
  configDelivery,
  loading: loading.effects['merchant/fetchSaveMerchant'],
}))
@Form.create()
class DeliveryEdit extends PureComponent {
  state = {
    id: '',
    title: '新增',
    distance_data: [],
    gps: [],
    geojson: {},
    gps_list: [],
    coordinates: [],
  };

  componentDidMount () {
    const { match } = this.props;
    this.getCommon();
    //获取地图数据
    this.initMap();

    // 编辑页面
    if (match.params.id) {
      this.setState({
        title: '编辑',
        id: match.params.id,
      }, () => {
        this.getInfo();
      });
    } else {
      this.selectCountry();
    }
  }

  getInfo = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'configDelivery/fetchCityDeliveryInfo',
      payload: {
        id: this.state.id,
      },
      callback: res => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        // console.log(data);
        //距离附加费
        const distance_data = data.distance_append_price;
        let distance_data_key = [];
        key_num = distance_data.length;
        distance_data.forEach((el, i) => {
          distance_data_key.push(i);
        });
        this.setState({
          'distance_data': distance_data,
          'gps_list': utils.isJsonParse(data.gps_list),
        });

        // 编辑数据赋值
        form.setFieldsValue({
          'country_id': data.country_id,
          'city_id': data.city_id,
          'basic_delivery_price': data.basic_delivery_price / 100,
          'keys': distance_data_key,
        }, () => {
          this.getCityData(data.country_id);
          this.selectCity(data.city_id);
        });

        //显示地图
        // if (utils.isJSON(data.sys_city.geojson)) {
        //   this.showMap(utils.isJsonParse(data.sys_city.geojson));
        // }
      },
    });
  }

  getCommon = () => {
    const { dispatch } = this.props;
    // 选择国家
    dispatch({
      type: 'common/getCountry',
      payload: {}
    });
  };

  getCityData = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/getCity',
      payload: {
        country_id: id,
      },
    });
  }

  // 国家城市联动
  selectCountry = (id) => {
    const { form, dispatch } = this.props;
    form.setFieldsValue({
      'city_id': undefined,
    });
    dispatch({
      type: 'common/getCity',
      payload: id ? { country_id: id } : 'clear'
    });
  };

  // 选择城市出现地图区域
  selectCity = id => {
    getCityInfo({
      id: id,
    }).then((res) => {
      if (!utils.successReturn(res)) return;
      const data = res.data.items;
      this.setState({
        gps: [...data.gps.split(',')],
        geojson: utils.isJsonParse(data.geojson),
      }, () => {
        // this.initMap()
        if (utils.isJSON(data.geojson)) {
          this.showMap(utils.isJsonParse(data.geojson));
        }
        this.setMapDraw(this.state.gps_list);
      })
    })
  }

  initMap = () => {
    mapboxgl.accessToken = configVar.mapConfig.accessToken;
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [104.91667, 11.55],
      zoom: 13,
    });

    map.on('load', () => {
      utils.onMapStyleLoad(map);
    });

    // 多边形画图工具
    Draw = new MapboxDraw({
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
            "fill-color": "#7372F0",
            "fill-outline-color": "#7372F0",
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
            "line-color": "#7372F0",
            "line-width": 2
          }
        },
        {
          "id": "gl-draw-polygon-and-line-vertex-active",
          "type": "circle",
          "paint": {
            "circle-radius": 3,
            "circle-color": "#7372F0",
          }
        }
      ]
    });
    map.addControl(Draw);
    map.on('draw.create', (e) => this.updateArea(e, Draw));
    map.on('draw.delete', (e) => this.updateArea(e, Draw));
    map.on('draw.update', (e) => this.updateArea(e, Draw));
  };

  updateArea = (e, draw) => {
    // console.log(e, draw);
    var data = draw.getAll();
    var arr1 = [], arr_data = [];
    if (data.features.length > 0) {
      // console.log('最后坐标', data)
      var arr = data.features[data.features.length - 1].geometry.coordinates[0];
      arr.forEach((item) => {
        // console.log(item)
        var arrData = {};
        arrData.lon = item[0];
        arrData.lat = item[1];
        arr1.push(arrData)
      });
      arr_data.push(arr1);
    }
    this.setState({
      gps_list: [...arr_data]
    }, () => {
      console.log('要提交的地图坐标 platformMap', this.state.gps_list);
    })
  }

  showMap = (geojson) => {
    // console.log(geojson);
    let t = new Date().getTime();
    // debugger
    if (Object.keys(geojson).length > 0) {
      map.addSource(`maine-park${t}`, {
        "type": "geojson",
        "data": geojson
      });

      map.addLayer({
        "id": "park-boundary",
        "type": "fill",
        "source": `maine-park${t}`,
        "paint": {
          "fill-color": "#008888",
          "fill-opacity": 0.2
        },
        "filter": ["==", "$type", "Polygon"]
      });

      if (this.state.gps[0] != '') {
        map.flyTo({ center: this.state.gps });
      }
    }
  }

  setMapDraw = data => {
    const arr = data[0];
    if (arr instanceof Array == true) {
      let coordinates = [];
      arr.forEach(el => {
        coordinates.push([el.lon, el.lat]);
      });
      this.setState({
        coordinates: coordinates,
      }, () => {
        console.log(this.state.coordinates);
        this.drawControl(this.state.coordinates);
      });
    }
  };

  drawControl = (coordinates) => {
    if (coordinates) {
      var arr = [];
      arr.push(coordinates);
      if (coordinates.length > 0) {
        var feature = {
          id: 'unique-id',
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: arr,
          },
        };
        var featureIds = Draw.add(feature);
      }
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    const { gps_list } = this.state;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue);
      if (gps_list.length == 0) return message.error('没有绘制配送区域');
      if (err) return;

      let formData = new FormData();
      Object.keys(fieldsValue).forEach(key => {
        if (key == 'basic_delivery_price') {
          formData.append(key, fieldsValue[key] * 100 || '');
        } else {
          formData.append(key, fieldsValue[key] || '');
        }
      });
      // 距离附加费
      let distance_append_data = fieldsValue.keys.map(key => fieldsValue.distance_append_price[key]);
      distance_append_data.forEach(el => {
        if (el.end_distance == '以上') {
          el.end_distance = '0';
        };
        el.price = el.price * 100;
      });
      // console.log(distance_append_data, formData.get('basic_delivery_price'));
      formData.append('distance_append_price', JSON.stringify(distance_append_data));

      // 画出来的配送范围
      formData.append('gps_list', JSON.stringify(gps_list));

      if (this.state.id) {
        formData.append('id', this.state.id);
      }
      // 提交表单
      dispatch({
        type: this.state.id ? 'configDelivery/editCityDelivery' : 'configDelivery/addCityDelivery',
        payload: formData,
        callback: res => {
          this.setState({ submitLoading: false });
          if (!utils.successReturn(res)) return;
          message.success('操作成功');
          router.goBack();
        },
      });
    });
  }

  onMenuClick = (param, k) => {
    console.log(param, k);
    const { form } = this.props;
    if (param.key == '0') {
      form.setFieldsValue({
        [`distance_append_price[${k}][end_distance]`]: '以上',
      });
    }
  }

  render () {
    const { title, distance_data } = this.state;
    const {
      common: {
        country = [],
        city = [],
      },
      form,
      loading
    } = this.props;
    const { getFieldDecorator } = form;

    const formLayout = {
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

    const formLayout_model = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 },
    };

    // 添加多项事件
    const removeItem = k => {
      const keys = form.getFieldValue('keys');
      if (keys.length === 0) {
        return;
      }
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    }
    const addFormItem = () => {
      const keys = form.getFieldValue('keys');
      const nextKeys = keys.concat(key_num++);
      form.setFieldsValue({
        keys: nextKeys,
      });
    }
    form.getFieldDecorator('keys', { initialValue: [0] });
    const keys = form.getFieldValue('keys');
    const AddFormItems = keys.map((k, index) => (
      <FormItem
        {...(index === 0 ? formLayout : submitFormLayout)}
        label={index === 0 ? '距离附加费' : ''}
        required
        key={k}
      >
        <span>
          <FormItem style={{ display: 'inline-block', width: '22%' }}>
            {getFieldDecorator(`distance_append_price[${k}][start_distance]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: distance_data[k] && distance_data[k].start_distance,
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
          <FormItem style={{ display: 'inline-block', width: '22%' }}>
            {getFieldDecorator(`distance_append_price[${k}][end_distance]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: distance_data[k] && (distance_data[k].end_distance == '0' ? '以上' : distance_data[k].end_distance),
            })(
              <Input placeholder="请输入" />
            )}
            {
              keys.length == index + 1 && (
                <span style={{ position: 'absolute', right: '7px' }}>
                  <Dropdown overlay={(
                    <Menu onClick={(param) => this.onMenuClick(param, k)}>
                      <Menu.Item key="0">以上</Menu.Item>
                    </Menu>
                  )} trigger={['click']}>
                    <Icon type="down" />
                  </Dropdown>
                </span>
              )
            }
          </FormItem>
          <span className="ant-form-text" style={{ marginLeft: 8 }}>公里，每公里加</span>
          <FormItem style={{ display: 'inline-block', width: '23%' }}>
            {getFieldDecorator(`distance_append_price[${k}][price]`, {
              rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
              initialValue: distance_data[k] && (distance_data[k].price / 100),
            })(<Input placeholder="请输入" addonBefore="$" />)}
          </FormItem>
        </span>
        {index === 0 ? (
          <Icon className="dynamic-button" type="plus-circle" title="增加附加费" onClick={addFormItem} />
        ) : (
            <Icon
              className="dynamic-button"
              type="minus-circle-o"
              title="删除"
              onClick={() => removeItem(k)}
            />
          )}
      </FormItem>
    ));

    return (
      <Fragment>
        <h3 className={styles.editTitle}><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} />{title + '配送'}</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="国家">
            {getFieldDecorator('country_id', {
              rules: [{ required: true, message: '必填' }],
            })(
              <Select placeholder="请选择" style={{ width: '100%' }} onChange={this.selectCountry} disabled={this.state.id != '' ? true : false}>
                {country.map((item, i) => (
                  <Option value={item.id} key={i}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="城市">
            {getFieldDecorator('city_id', {
              rules: [{ required: true, message: '必填' }],
            })(
              <Select placeholder="请选择" style={{ width: '100%' }} onChange={this.selectCity} disabled={this.state.id != '' ? true : false}>
                {city.map((item, i) => (
                  <Option value={item.id} key={i}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="基础配送费">
            {getFieldDecorator('basic_delivery_price', {
              rules: [{ required: true, message: '必填' }, { message: '请输入正确的金额格式！', pattern: utils.isMoney() }],
            })(<Input placeholder="请输入" addonBefore="$" />)}
          </FormItem>
          {AddFormItems}
          <div className="m-t-16">
            <FormItem {...formLayout} label="配送区域">
              <div
                id="map"
                className="map_box"
                style={{ width: 640, height: 400 }}
              ></div>
            </FormItem>
          </div>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              <FormattedMessage id="form.save" />
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
              <FormattedMessage id="form.cancel" />
            </Button>
          </FormItem>
        </Form>
      </Fragment>
    );
  }
}

export default DeliveryEdit;