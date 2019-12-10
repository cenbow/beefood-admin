import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Row, Col, Card, Input, Button, message, Icon } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import ReactMapboxGl, { MapContext, GeoJSONLayer, Popup } from 'react-mapbox-gl';

const { Description } = DescriptionList;
const fillColor = ['#f2d163', '#eb2f96', '#f5222d', '#fa541c', '#fa8c16', '#52c41a', '#1890ff']

const Map = ReactMapboxGl({
  accessToken: configVar.mapConfig.accessToken,
});

@connect(({ business, loading }) => ({
  business,
  loading: loading.effects['business/fetchRegionDetails'],
}))
class RegionDetails extends Component {
  state = {
    center: [104.91667, 11.55],
    data: [],
    business_geojson: [],
    business_info: '',
  };

  static Maps;

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'business/fetchRegionDetails',
      payload: {
        id: match.params.id,
      },
      callback: res => {
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        console.log(data);

        //判断是否有区域下的商圈
        let business_geojson = data.sys_business || [];
        if (business_geojson.length > 0) {
          business_geojson.forEach(el => {
            let gps_list = utils.isJsonParse(el.gps_list);
            let arr = [];
            for (let i = 0; i < gps_list.length; i++) {
              arr.push((gps_list[i].lat + ',' + gps_list[i].lon).split(','));
            }
            el.geojson = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [arr],
                  },
                },
              ],
            };
          });
          this.setState({
            business_geojson: business_geojson,
          });
        };

        // 区域中心点获取
        if (data.geojson && utils.isJsonParse(data.geojson)) {
          const geojson = utils.isJsonParse(data.geojson);
          try {
            if (geojson.features[0].properties.center) {
              let center = geojson.features[0].properties.center;
              this.setState({
                center: [...[center.lng, center.lat]],
              });
            }
            if (geojson.features[1].geometry.coordinates) {
              let center = geojson.features[1].geometry.coordinates;
              this.setState({
                center: [...center],
              });
            }
          } catch (error) {
            console.log(error);
            message.info('区域geojson数据，无中心标点');
          }
        } else {
          message.error('区域geojson数据错误');
        }
      },
    });
  }

  onLoadMap = (map) => {
    this.Maps = map;
  }

  showBusinessInfo = (e,info) => {
    this.setState({
      business_info: {
        'coordinates': [e.lngLat.lng, e.lngLat.lat],
        'name': info.name,
        'bd_name': info.sys_bd_data.name ? info.sys_bd_data.name : '',
        'total_merchant': info.total_merchant,
      }
    })
  }

  onClickPopup = () => {
    // console.log('11');
    this.setState({
      business_info: '',
    })
  }

  render() {
    const { business, loading } = this.props;
    const { regionDetails = {} } = business;
    const { business_geojson, business_info } = this.state;
    
    const colLayout = {xs: 12,sm: 8,md: 4,};

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">
            <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => router.goBack()}
            />{'区域详情'}
          </span>
        </div>
        {regionDetails.name != undefined && (
          <div>
            <Row>
              <Col {...colLayout} className="m-b-12">
                <span>区域名称：</span>
                {regionDetails.name}
              </Col>
              <Col {...colLayout} offset={1} className="m-b-12">
                <span>国家：</span>
                {regionDetails.sys_city.sys_country.name}
              </Col>
              <Col {...colLayout} offset={1} className="m-b-12">
                <span>城市：</span>
                {regionDetails.sys_city.name}
              </Col>
              <Col {...colLayout} offset={1} className="m-b-12">
                <span>商圈数量：</span>
                {regionDetails.total_sys_business}
              </Col>
            </Row>
            <div style={{ marginTop: 24, width: '70%', height: '600px' }}>
              <Map
                style="mapbox://styles/mapbox/streets-v9"
                onStyleLoad={map => { utils.onMapStyleLoad(map) }}
                containerStyle={{height: '100%',width: '100%'}}
                center={this.state.center}
                // zoom={[13]}
              >
                <MapContext.Consumer>
                  {(map) => { this.onLoadMap(map) }}
                </MapContext.Consumer>
                <GeoJSONLayer
                  data={regionDetails.geojson != '' ? JSON.parse(regionDetails.geojson) : {}}
                  fillPaint={{
                    'fill-color': '#888888',
                    'fill-opacity': 0.6,
                  }}
                />
                {/* 已经存在的商圈 */}
                {
                  business_geojson.length > 0 ? business_geojson.map((item,i) => {
                    return (
                      <GeoJSONLayer
                        data={item.geojson}
                        fillPaint={{
                          'fill-color': fillColor[i] || fillColor[0],
                          'fill-opacity': 0.8,
                        }}
                        fillOnClick={(e) => this.showBusinessInfo(e, item)}
                      />
                    );
                  }): null
                }
                {/* 点击显示商圈信息 */}
                {
                  business_info && (
                    <Popup
                      coordinates={business_info.coordinates}
                      offset={{
                        'bottom-left': [12, -10], 'bottom': [0, -10], 'bottom-right': [-12, -10]
                      }}
                    >
                      <div style={{position:'relative'}}>
                        <div style={{ position: 'absolute', top: '-19px',right: '-19px',fontSize: '18px', backgroundColor: '#fff', borderRadius: '100%', }}>
                          <Icon type="close-circle" title="关闭" onClick={this.onClickPopup} />
                        </div>
                        <h1>名称：{business_info.name}</h1>
                        <div>
                          <span>BD负责人：{business_info.bd_name||'（暂无负责人）'}</span>
                          <span style={{marginLeft: 30}}>商家数量：{business_info.total_merchant}</span>
                        </div>
                      </div>
                    </Popup>
                  )
                }
              </Map>
            </div>
          </div>
        )}
      </Card>
    );
  }
}

export default RegionDetails;
