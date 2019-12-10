import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Radio,
  Upload,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import utils from '@/utils/utils';
import { getBusinessInfo } from '@/services/business';
import configVar from '@/utils/configVar';
import ReactMapboxGl, { ZoomControl, GeoJSONLayer, Marker, Layer, Feature, MapContext } from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import styles from '@/assets/css/TableList.less';
const Map = ReactMapboxGl({
  accessToken: configVar.mapConfig.accessToken,
});

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 13 },
};

const formBtnLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 13, offset: 4 },
  },
};

const geojson = {};

// 新增
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      center: [104.91667, 11.55],
      gps_list: '',
    };
  }

  componentDidMount(){
    this.initMap();
  }

  initMap = () => {
    const { regionDetails } = this.props;
    // 区域中心点获取
    let region_geojson = regionDetails.geojson;
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
        lat: el[0],
        lon: el[1],
      });
    });
    this.setState({
      gps_list: JSON.stringify(gps_list),
    });
  };

  onLoadMap = (map) => {
    
  }

  render() {
    const {
      modalVisible,
      form,
      handleAdd,
      handleModalVisible,
      regionDetails,
      business,
    } = this.props;
    const { uploadLoading, imageUrl } = this.state;
    const geojson = JSON.parse((regionDetails && regionDetails.geojson) || '{}');
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        if (!this.state.gps_list) return message.error('请画出商圈范围');
        fieldsValue.gps_list = this.state.gps_list;
        handleAdd(fieldsValue);
      });
    };
    return (
      <Modal
        width={960}
        destroyOnClose
        title="新增商圈"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <Form>
          <FormItem {...formLayout} label="商圈名称">
            {form.getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a
                onClick={() => {
                  utils.translator(form, 'name');
                }}
              >
                翻译
              </a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文商圈名称">
            {form.getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文商圈名称">
            {form.getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="商圈范围" required>
            <div style={{ width: 720, height: 530 }}>
              <Map
                style="mapbox://styles/mapbox/streets-v9"
                onStyleLoad={map => { utils.onMapStyleLoad(map) }}
                containerStyle={{
                  height: '100%',
                  width: '100%',
                }}
                center={this.state.center}
              >
                <ZoomControl />
                <MapContext.Consumer>
                  {(map) => { this.onLoadMap(map) }}
                </MapContext.Consumer>
                <GeoJSONLayer
                  data={geojson}
                  fillPaint={{
                    'fill-color': '#088',
                    'fill-opacity': 0.8,
                  }}
                />
                {/* 已经存在的商圈 */}
                {business && business.length > 0
                  ? business.map((item,i) => {
                      return (
                        <GeoJSONLayer
                          key={i}
                          data={item.geojson}
                          fillPaint={{
                            'fill-color': '#FF9800',
                            'fill-opacity': 0.5,
                          }}
                        />
                      );
                    })
                  : null}
                <DrawControl
                  onDrawCreate={this.onDrawCreate}
                  onDrawUpdate={this.onDrawUpdate}
                  controls={{ polygon: 'on', trash: 'on' }}
                  displayControlsDefault={false}
                />
              </Map>
            </div>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
      gps_list: props.values.gps_list || '',
      center: [104.91667, 11.55],
      coordinates: [],
    };
  }

  static drawControl;

  componentDidMount() {
    this.initMap();
    this.setMapDraw(this.state.gps_list);
  }

  initMap = () => {
    const { regionDetails } = this.props;
    // 区域中心点获取
    let region_geojson = regionDetails.geojson;
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
  }

  setMapDraw = data => {
    let arr = JSON.parse(data);
    if (arr instanceof Array == true) {
      let coordinates = [];
      arr.forEach(el => {
        coordinates.push([el.lat, el.lon]);
      });
      this.setState(
        {
          coordinates: coordinates,
        },
        () => {
          console.log(this.state.coordinates);
        }
      );
    }
  };

  okHandle = () => {
    const { form, handleUpdate, values, business } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (!this.state.gps_list) return message.error('请画出商圈范围');
      fieldsValue.id = values.id;
      fieldsValue.gps_list = this.state.gps_list;
      handleUpdate(fieldsValue);
    });
  };

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
    console.log(arr);
    
    arr.forEach(el => {
      gps_list.push({
        lat: el[0],
        lon: el[1],
      });
    });
    this.setState({
      gps_list: JSON.stringify(gps_list),
    });
  };

  drawControl = ref => {
    if (ref != null) {
      let arr = [];
      arr.push(this.state.coordinates);
      console.log(ref);
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

  onLoadMap = (map) => {
  }

  renderContent = formVals => {
    const { form, regionDetails, business } = this.props;
    const geojson = JSON.parse((regionDetails && regionDetails.geojson) || '{}');

    return (
      <Form>
        <FormItem {...formLayout} label="商圈名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_cn,
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a
              onClick={() => {
                utils.translator(form, 'name');
              }}
            >
              翻译
            </a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文商圈名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文商圈名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="商圈范围" required>
          <div style={{ width: 720, height: 530 }}>
            <Map
              style="mapbox://styles/mapbox/streets-v9"
              onStyleLoad={map => { utils.onMapStyleLoad(map) }}
              containerStyle={{
                height: '100%',
                width: '100%',
              }}
              center={this.state.center}
              // zoom={[10]}
            >
              <ZoomControl />
              <MapContext.Consumer>
                {(map) => { this.onLoadMap(map) }}
              </MapContext.Consumer>
              <GeoJSONLayer
                data={geojson}
                fillPaint={{
                  'fill-color': '#088',
                  'fill-opacity': 0.8,
                }}
              />
              {/* 已经存在的商圈 */}
              {business && business.length > 0
                ? business.map((item,i) => {
                    return (
                      <GeoJSONLayer
                        key={i}
                        data={item.geojson}
                        fillPaint={{
                          'fill-color': '#FF9800',
                          'fill-opacity': 0.5,
                        }}
                      />
                    );
                  })
                : null}
              <DrawControl
                onDrawCreate={this.onDrawCreate}
                onDrawUpdate={this.onDrawUpdate}
                controls={{ polygon: 'on', trash: 'on' }}
                displayControlsDefault={false}
                ref={this.drawControl}
              />
            </Map>
          </div>
        </FormItem>
      </Form>
    );
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { formVals } = this.state;

    return (
      <Modal
        width={960}
        destroyOnClose
        title="编辑商圈"
        visible={updateModalVisible}
        onOk={this.okHandle}
        onCancel={() => handleUpdateModalVisible(false)}
        afterClose={() => handleUpdateModalVisible()}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

// 列表
@connect(({ business, common, loading }) => ({
  business,
  common,
  loading: loading.models.business,
}))
@Form.create()
class Business extends PureComponent {
  state = {
    region_id: '',
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  componentDidMount() {
    const { match } = this.props;
    const id = match.params.id;
    this.setState(
      {
        region_id: id,
      },
      () => {
        this.getList();
      }
    );
  }

  getList = newParams => {
    const { dispatch } = this.props;
    this.getRegionInfo();
    this.getAllBusiness();
    
    let getParams = {
      page: 1,
      pagesize: 25,
      region_id: this.state.region_id,
      ...newParams,
    };

    dispatch({
      type: 'business/fetchBusinessList',
      payload: getParams,
    });
  };

  getRegionInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'business/fetchRegionDetails',
      payload: {
        id: this.state.region_id,
      },
    });
  };
  //获取区域中的所有的商圈
  getAllBusiness = () => {
    const { dispatch, match } = this.props;
    const id = match.params.id;
    dispatch({
      type: 'common/getBusiness',
      payload: {
        region_id: id,
      },
      callback: res => {
        if (res.code == 200) {
          res.data.items.forEach(item => {
            var arr1 = [];
            var arr2 = [];
            JSON.parse(item.gps_list).forEach(item1 => {
              var arr = [];
              // console.log(item1);
              arr.push(item1.lat);
              arr.push(item1.lon);
              arr1.push(arr);
            });
            arr2.push(arr1);
            item.geojson = {
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
          });
        }
      },
    });
  };
  columns = [
    {
      title: '商圈',
      dataIndex: 'name',
    },
    {
      title: '所属区域',
      render: (text, record) => <span>{record.sys_region.name}</span>,
    },
    {
      title: '所属城市',
      render: (text, record) => <span>{record.sys_region.sys_city.name}</span>,
    },
    {
      title: '所属国家',
      render: (text, record) => <span>{record.sys_region.sys_city.sys_country.name}</span>,
    },
    {
      title: '操作',
      width: 220,
      render: (text, record) => (
        <Fragment>
          <Link to={'/business/details/' + record.id}>详情</Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

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

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    console.log(fields);
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('region_id', this.state.region_id);
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'business/fetchBusinessSave',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
        this.handleModalVisible();
      },
    });
  };

  // 编辑数据
  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    getBusinessInfo({
      id: record.id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    });
  };

  handleUpdate = fields => {
    console.log(fields);
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('region_id', this.state.region_id);
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'business/fetchBusinessEdit',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
        this.handleUpdateModalVisible();
      },
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

  handleDelete = fields => {
    console.log(fields);
    const { dispatch } = this.props;

    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'business/fetchBusinessDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      this.getList(values);
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="商圈">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
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
    );
  }

  render() {
    const {
      business: { businessList, regionDetails },
      common: { business },
      loading,
    } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };

    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <div className="page_head_title">
              <Button
                type="default"
                shape="circle"
                icon="left"
                className="fixed_to_head"
                onClick={() => router.goBack()}
              />{' '}
              商圈
            </div>
            <div className="fr">
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增商圈
              </Button>
            </div>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={businessList}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {
          modalVisible && (
            <CreateForm
              {...parentMethods}
              modalVisible={modalVisible}
              regionDetails={regionDetails}
              business={business}
            />
          )
        }
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
            regionDetails={regionDetails}
            business={business}
          />
        ) : null}
      </div>
    );
  }
}

export default Business;
