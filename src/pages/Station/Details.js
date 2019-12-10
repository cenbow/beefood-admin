import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Button, message } from 'antd';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import DescriptionList from '@/components/DescriptionList';
import ReactMapboxGl, { GeoJSONLayer, Cluster, Marker, MapContext } from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const { Description } = DescriptionList;

const Map = ReactMapboxGl({
  accessToken: configVar.mapConfig.accessToken,
});

@connect(({ station, loading }) => ({
  station,
  loading: loading.models.station,
}))
class RegionDetails extends Component {
  state = {
    id: '',
    center: [104.91667, 11.55],
    business_geojson: {},
    gps_list: '',
    coordinates: [],
    station_list: [],
    merchant_gps: [],
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    this.setState({
      id: match.params.id,
    },()=>{
      this.getDetails();
    });
  }

  // 获取详情信息
  getDetails = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'station/fetchStationDetails',
      payload: {
        id: this.state.id,
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        console.log(data);
        let center = [], station_list = [], merchant_gps = [];
        // 获取当前商圈地标和范围
        center = utils.jsonArray(data.sys_station_business.sys_business.gps_list);
        if (center[0].lon > center[0].lat) {
          this.setState({
            center: [center[0].lon, center[0].lat],
          })
        } else {
          this.setState({
            center: [center[0].lat, center[0].lon],
          })
        }

        // 获取当前商圈下其它的站点数据
        if (data.other_station_data.length > 0) {
          const station_data = data.other_station_data;
          // 站点gps_list集合，商家gps集合
          for (let i = 0; i < station_data.length; i++) {
            station_list.push(station_data[i].sys_station.gps_list);
          }
        }

        // 获取当前商圈下的商家数
        let user_info_data = data.sys_station_business.sys_business.m_user_info_data;
        if (user_info_data.length > 0){
          for (let g = 0; g < user_info_data.length; g++) {
            merchant_gps.push(user_info_data[g].gps.split(','));
          }
        }

        // 保存数据
        this.setState({
          business_geojson: this.showGeojson(center),
          station_list: [],
          merchant_gps: merchant_gps,
          gps_list: data.gps_list,
        }, () => {
            this.setMapDraw(this.state.gps_list);
            console.log(this.state.station_list);
            console.log(this.state.merchant_gps);
        });
      }
    });
  }

  onLoadMap = (map, data) => {
    // let center = utils.isJsonParse(data.gps_list);
    // if (center) {
    //   try {
    //     map.easeTo({ center: center[0] });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  }

  setMapDraw = data => {
    if (data) {
      try {
        const arr = JSON.parse(data);
        // console.log(arr);
        
        let coordinates = [];
        arr.forEach(el => {
          coordinates.push([el.lat, el.lon]);
        });
        this.setState({
          coordinates: coordinates,
        }, () => {
          // console.log(this.state.coordinates);
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  drawControl = ref => {
    if (ref != null) {
      var arr = [];
      arr.push(this.state.coordinates);
      // console.log(ref, arr);
      if (this.state.coordinates.length > 0) {
        var feature = {
          id: 'unique-id',
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: arr,
          },
        };
        var featureIds = ref.draw.add(feature);
      }
    }
  };

  showGeojson = data => {
    let arr = [];
    data.forEach(el => {
      arr.push([el.lat, el.lon]);
    });
    let obj = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [arr],
          }
        },
      ]
    }
    return obj;
  }

  onDrawCreate = ({ features }) => {
    console.log(features);
    this.showGpsList(features);
  };

  onDrawUpdate = ({ features }) => {
    console.log(features);
    this.showGpsList(features);
  };

  showGpsList = data => {
    const arr = data[0].geometry.coordinates[0];
    let gps_list = [];
    arr.forEach(el => {
      gps_list.push({
        lon: el[0],
        lat: el[1],
      });
    });
    this.setState({
      gps_list: JSON.stringify(gps_list),
    });
  };

  onTakeRange = () => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', this.state.id);
    formData.append('gps_list', this.state.gps_list);
    dispatch({
      type: 'station/fetchTakeRange',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getDetails();
      },
    });
  }

  render() {
    const { station, loading } = this.props;
    const { stationDetails = {} } = station;
    const { merchant_gps } = this.state;

    const colLayout = {
      xs: 12,
      sm: 8,
      md: 4,
    };

    return (
      <Card bordered={false} loading={loading}>
        <div className="page_head">
          <span className="page_head_title">
            <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => router.goBack()}
            />{'站点详情'}
          </span>
        </div>
        {stationDetails.name != undefined && (
          <div>
            <Row className="m-b-12">
              <Col {...colLayout}>
                <span>站点名称：</span>
                {stationDetails.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>国家：</span>
                {stationDetails.sys_country.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>城市：</span>
                {stationDetails.sys_city.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>区域：</span>
                {stationDetails.sys_region.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>商圈：</span>
                {stationDetails.sys_station_business && stationDetails.sys_station_business.sys_business.name}
              </Col>
            </Row>
            <Row className="m-b-30">
              <Col {...colLayout}>
                <span>站长：</span>
                {stationDetails.sys_station_agent && stationDetails.sys_station_agent.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>联系方式：</span>
                {stationDetails.sys_station_agent && stationDetails.sys_station_agent.mobile}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>商家数量：</span>
                {stationDetails.total_merchant}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>骑手数量：</span>
                {stationDetails.total_driver}
              </Col>
            </Row>
            <div className="page_head">
              <span className="page_head_title">{'骑手取件范围'}</span>
            </div>
            <div className="m-b-12" style={{ width: '70%', height: '600px', position: 'relative' }}>
              <div className="map_title_tips">
                <div className="color_tips">
                  <span className="color color1"></span>
                  <span>商圈范围</span>
                </div>
                <div className="color_tips">
                  <span className="color color2"></span>
                  <span>其他站点取件范围</span>
                </div>
              </div>
              <Map
                style="mapbox://styles/mapbox/streets-v9"
                onStyleLoad={map => { utils.onMapStyleLoad(map) }}
                containerStyle={{
                  height: '100%',
                  width: '100%',
                }}
                center={this.state.center}
                // zoom={[12]}
              >
                <MapContext.Consumer>
                  {(map) => { this.onLoadMap(map, stationDetails) }}
                </MapContext.Consumer>
                {/* 商家点集合 */}
                {
                  merchant_gps.map((item,i)=>(
                    <Marker
                      key={i}
                      coordinates={item}
                      anchor="bottom"
                      className="merchant_gps_marker"
                    />
                  ))
                }
                {/* <Cluster ClusterMarkerFactory={this.clusterMarker}>

                </Cluster> */}
                {/* 商圈范围 */}
                <GeoJSONLayer
                  data={this.state.business_geojson}
                  fillPaint={{
                    'fill-color': '#009688',
                    'fill-opacity': 0.4,
                  }}
                />
                {/* 已经存在的站点 */}
                {
                  stationDetails.other_station_data.length > 0 ? stationDetails.other_station_data.map((item, i) => {
                    return (
                      <GeoJSONLayer
                        key={i}
                        data={item.geojson}
                        fillPaint={{
                          'fill-color': '#FF9800',
                          'fill-opacity': 0.5,
                        }}
                      />
                    )
                  }) : null
                }
                <DrawControl
                  onDrawCreate={this.onDrawCreate}
                  onDrawUpdate={this.onDrawUpdate}
                  controls={{ polygon: 'on', trash: 'on' }}
                  displayControlsDefault={false}
                  ref={this.drawControl}
                  styles={[
                    // ACTIVE (being drawn)
                    // line stroke
                    {
                      "id": "gl-draw-line",
                      "type": "line",
                      "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                      "layout": {
                        "line-cap": "round",
                        "line-join": "round"
                      },
                      "paint": {
                        "line-color": "#e51c23",
                        "line-dasharray": [0.2, 2],
                        "line-width": 2
                      }
                    },
                    // polygon fill
                    {
                      "id": "gl-draw-polygon-fill",
                      "type": "fill",
                      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                      "paint": {
                        "fill-color": "#e51c23",
                        "fill-outline-color": "#e51c23",
                        "fill-opacity": 0
                      }
                    },
                    // polygon outline stroke
                    // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
                    {
                      "id": "gl-draw-polygon-stroke-active",
                      "type": "line",
                      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                      "layout": {
                        "line-cap": "round",
                        "line-join": "round"
                      },
                      "paint": {
                        "line-color": "#e51c23",
                        "line-dasharray": [0.2, 2],
                        "line-width": 2
                      }
                    },
                    // vertex point halos
                    {
                      "id": "gl-draw-polygon-and-line-vertex-halo-active",
                      "type": "circle",
                      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                      "paint": {
                        "circle-radius": 5,
                        "circle-color": "#FFF"
                      }
                    },
                    // vertex points
                    {
                      "id": "gl-draw-polygon-and-line-vertex-active",
                      "type": "circle",
                      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                      "paint": {
                        "circle-radius": 3,
                        "circle-color": "#e51c23",
                      }
                    },
                  ]}
                />
              </Map>
            </div>
            <div>
              <Button type="primary" onClick={() => { this.onTakeRange() }} >保存</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => { location.reload() }}>取消</Button>
            </div>
          </div>
        )}
      </Card>
    );
  }
}

export default RegionDetails;
