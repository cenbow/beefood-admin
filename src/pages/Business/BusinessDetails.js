import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Button, DatePicker, message } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import ReactMapboxGl, { ZoomControl, GeoJSONLayer, Marker } from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';

const geojson = {};
const { Description } = DescriptionList;
const Map = ReactMapboxGl({
  accessToken: configVar.mapConfig.accessToken,
});

@connect(({ business, loading }) => ({
  business,
  loading: loading.effects['business/fetchBusinessDetails'],
}))
class BusinessDetails extends Component {
  state = {
    center: [104.91667, 11.55],
    data: {},
  };
  static drawControl;
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'business/fetchBusinessDetails',
      payload: {
        id: match.params.id,
      },
      callback: res => {
        if (!utils.successReturn(res)) return;
        this.initMap(res.data.items);
      },
    });
  }

  initMap = data => {
    // console.log(111);
    // let geojson = JSON.parse(data.sys_region.geojson);
    // let center_data = geojson.features[0].geometry.coordinates[0];
    // let center = [0, 0];
    var arr1 = [];
    var arr2 = [];
    var data1 = {};
    try {
      JSON.parse(data.gps_list).forEach(item1 => {
        var arr = [];
        arr.push(item1.lat);
        arr.push(item1.lon);
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
    } catch (error) {
      console.log(error);
    }
    this.setState({
      // center: arr2[0][0] || this.state.center,
      data: data1,
    });

    // 区域中心点获取
    let region_geojson = data.sys_region.geojson;
    if (region_geojson && utils.isJsonParse(region_geojson)) {
      const geojson = utils.isJsonParse(region_geojson);
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
  };

  render() {
    const { business, loading } = this.props;
    const { businessDetails = {} } = business;
    const geojson = JSON.parse(
      (businessDetails.sys_region && businessDetails.sys_region.geojson) || '{}'
    );
    const colLayout = {
      xs: 11,
      sm: 7,
      md: 3,
    };
    console.log(this.state.data);
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
            />{'商圈详情'}
          </span>
        </div>
        {businessDetails.name != undefined && (
          <div>
            <Row className="m-b-30">
              <Col {...colLayout}>
                <span>商圈名称：</span>
                {businessDetails.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>国家：</span>
                {businessDetails.sys_region && businessDetails.sys_region.sys_city.sys_country.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>城市：</span>
                {businessDetails.sys_region && businessDetails.sys_region.sys_city.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>区域：</span>
                {businessDetails.sys_region && businessDetails.sys_region.name}
              </Col>
              <Col {...colLayout} offset={1}>
                <span>
                  BD负责人：
                  {businessDetails.sys_bd_data != ''
                    ? businessDetails.sys_bd_data.name
                    : '(暂无负责人)'}
                </span>
              </Col>
              <Col {...colLayout} offset={1}>
                <span>商家数量：</span>
                {businessDetails.total_merchant}
              </Col>
              {/* <Col {...colLayout} offset={1}>
                <span>站点数：</span>
                {businessDetails.total_station}
              </Col>
              <Col {...colLayout}>
                <span>站长：</span>
                {businessDetails.sys_station_agent_data &&
                  businessDetails.sys_station_agent_data.name}
              </Col> */}
              {/* <Col {...colLayout}>
                <span>骑手数量：</span>
                {businessDetails.total_driver}
              </Col> */}
            </Row>
            <div style={{ width: ' 70%', height: '600px' }}>
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
                <ZoomControl />
                <GeoJSONLayer
                  data={geojson}
                  fillPaint={{
                    'fill-color': '#088',
                    'fill-opacity': 0.8,
                  }}
                />
                <GeoJSONLayer
                  data={this.state.data}
                  fillPaint={{
                    'fill-color': '#FF9800',
                    'fill-opacity': 0.5,
                  }}
                />
              </Map>
            </div>
          </div>
        )}
      </Card>
    );
  }
}

export default BusinessDetails;
