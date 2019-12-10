import React, { Component } from 'react';
import { message } from 'antd';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import GoogleMapReact from 'google-map-react';

let Maps;
let getMap;
let Marker;
let dataProps = {}

class index extends Component {
  static defaultProps = {
    center: {
      lng: 104.91667,
      lat: 11.55
    },
    zoom: 8
  };
  state = {
    gps: [],
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  // 初始化地图
  apiIsLoaded = (map, maps, center) => {
    // console.log(map, maps);
    getMap = map;
    Maps = maps;

    //编辑状态使用
    this.initMap(center);
  };

  // 地图使用
  initMap = (LatLng) => {
    const { markerDraggable } = this.props;
    // console.log(LatLng);
    if (!LatLng.lat || !LatLng.lng) {
      LatLng = this.state.center;
    }

    this.setState({
      gps: [...[LatLng.lng, LatLng.lat]]
    }, () => {
      this.onChangeMap(this.state.gps);
    });

    if (!Maps) return;
    var myLatlng = new Maps.LatLng(LatLng.lat, LatLng.lng);

    // var mapOptions = {
    //   zoom: 8,
    //   center: myLatlng
    // }
    // var map = new Maps.Map(document.getElementById("map"), mapOptions);

    //显示地址定位
    getMap.setCenter(myLatlng);

    // 标点搜索地址定位
    let markerOptions = {
      position: myLatlng,
      map: getMap,
    }
    if (!markerDraggable){
      markerOptions = {
        ...markerOptions,
        draggable: true,
      }
    }
    Marker = new Maps.Marker(markerOptions);

    // 拖动选地点
    Marker.addListener('dragend', this.onDragEnd);
  };

  onDragEnd = (data) => {
    // console.log(data);
    let gpsLatLng = data.latLng.lng() + ',' + data.latLng.lat();
    this.setState({
      gps: [...gpsLatLng.split(",")]
    }, () => {
      this.onChangeMap(this.state.gps);
    });
  }

  searchGeocoding = (content) => {
    if (!content) return message.info("请输入地址");
    if (!Maps) return message.info("地图没能正确加载，请刷新页面");
    let geocoder = new Maps.Geocoder();
    geocoder.geocode({ 'address': content }, (results, status) => {
      if (status == 'OK') {
        Marker.setMap(null);
        let gps = results[0].geometry.location;
        // 返回搜索数据
        dataProps.geocoder = results[0];
        this.initMap({
          lng: gps.lng(),
          lat: gps.lat()
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  onChangeMap = (gps) =>{
    this.props.onChange(gps, {
      ...dataProps
    });
  }

  render() {
    const { style, center, zoom, markerDraggable } = this.props;
    
    const _center = {
      lng:  Number(center.lng),
      lat: Number(center.lat)
    }

    return (
      <div
        id="map"
        className="map_box"
        style={{ width: '100%', height: '100%', ...style }}
      >
        <GoogleMapReact
          bootstrapURLKeys={{ key: configVar.google_api_key }}
          defaultCenter={_center}
          defaultZoom={zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => this.apiIsLoaded(map, maps, center)}
        >
        </GoogleMapReact>
      </div>
    )
  }
}

export default index;