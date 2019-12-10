import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Icon,
  Menu,
  Dropdown,
  Card,
  DatePicker,
  Radio,
  Upload,
  message,
} from 'antd';
import utils, { getBase64, beforeUpload, } from '@/utils/utils';
import SelectStoreForm from '@/components/SelectStoreForm';
import moment from 'moment'; // 时间戳转换插件
import { uploadImage, getDriver } from '@/services/common'; // 上传图片
import { getAccessCardInfo } from '@/services/accesscardServices';
import ShowImg from '@/components/showImg';
import configVar from '@/utils/configVar';
import GoogleMapReact from 'google-map-react';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
const { RangePicker } = DatePicker;
let timeout;
let currentValue;

let Maps;
let map;

@connect(({ common, list, accessCard, loading }) => ({
  common,
  list,
  accessCard,
  loading: loading.models.accessCard,
}))
@Form.create()
class AccessCardCreate extends PureComponent {
  state = {
    formValues: {},
    ACId: '',
    gps: '104.91667, 11.55',
    uploadLoading: false,
    urlTypeView: 1,
    selectStoreModalVisible: false,
    logoUrl: '',
    imageUrl: '',
    editStatus: false, // 编辑状态
    submitLoading: false,
    driverIdData: [],
    driverIdValue: undefined,
    driverIdList: [],
    selectedItems: [],
    driverIdName: '',
    center: {
      lng: 104.91667,
      lat: 11.55
    },
    zoom: 11,
  };

  componentDidMount () {
    !this.state.editStatus ? this.getDriverFn() : undefined

    const { dispatch, match } = this.props;
    const { params } = match;
    const { id } = params; // 页面跳转传参
    if (id) {
      this.setState({
        ACId: id,
        editStatus: true,
      }, () => {
        this.AccessCardInfo(id);
      });
    }
  }


  handleSelectedChange = selectedItems => {
    // console.log('selectedItems', selectedItems)

    this.setState({ selectedItems });
  };

  accessCardWrite = (types, fields) => {
    const { dispatch } = this.props;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: types,
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        if (this.state.editStatus) {
          message.success('编辑成功');
          router.goBack();
        } else {
          message.success('添加成功');
          router.goBack();
        }
      },
    });
    // console.log('新增出入证列表', fields);
  };

  // 获取编辑信息
  AccessCardInfo = idNum => {
    const { formValues, driverIdList, driverIdName } = this.state;
    const { form } = this.props;
    getAccessCardInfo({ id: idNum }).then(res => {
      if (!utils.successReturn(res)) return;
      const data = res.data.items;


      // this.setState({
      //   formValues: values,
      // });
      // console.log('赋值后values', this.state.formValues);

      form.setFieldsValue({
        status: data.status,
        logo: data.logo,
        name_cn: data.name_cn,
        name_en: data.name_en,
        name_kh: data.name_kh,
        address: data.address,
        company_cn: data.company_cn,
        company_en: data.company_en,
        company_kh: data.company_kh,
        driver_id: data.driver_id,
        range_picker_add: [data.start_time, data.end_time]
      }, () => {
        const values = {
          ...data,
        };
        this.setState({
          formValues: values,
          gps: [...data.gps.split(",")],
        }, () => {
          const driverId = [data.driver_id]
          const driverIdListFilter = this.state.driverIdList
          // if (driverId) {
          const filterName = driverIdListFilter.filter(o => driverId.includes(o.id));
          const resultName = filterName[0] && filterName[0].d_driver_info ? filterName[0].d_driver_info.nickname : null
          console.log('resultName', resultName)
          // if (filterName && filterName[0] && resultName) {
          this.setState({ driverIdName: resultName })
          // }
          // }

          console.log(this.state.gps);
          // 获取地图数据
          this.initMap({
            'lng': this.state.gps[0],
            'lat': this.state.gps[1],
          });
        })
      });

    });
  };

  saveForm = e => {
    e.preventDefault();
    const { editStatus, gps } = this.state;
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log('fieldsValue', fieldsValue);
      if (!err) {
        this.setState({ submitLoading: true });
        // console.log('fieldsValue', fieldsValue)
        if (fieldsValue.range_picker_add) {
          const rangeValue = fieldsValue.range_picker_add;
          fieldsValue.start_time = moment(rangeValue[0]).unix();
          fieldsValue.end_time = moment(rangeValue[1]).unix();
          delete fieldsValue.range_picker_add;
        }

        if (fieldsValue.range_picker) {
          const rangeValue = fieldsValue.range_picker;
          fieldsValue.start_time = moment(rangeValue[0]).unix();
          fieldsValue.end_time = moment(rangeValue[1]).unix();
          delete fieldsValue.range_picker;
        }



        if (editStatus) {
          const editValues = {
            id: this.state.ACId,
            ...fieldsValue,
            gps: this.state.gps,
          };
          this.setState({
            formValues: editValues,
          });
          console.log('editValues', editValues);
          this.accessCardWrite('accessCard/fetchAccessCardEdit', editValues);
        } else {
          // 传递多选的骑手ID
          if (fieldsValue.driver_id) {
            const filterName = this.state.driverIdList.filter(o => fieldsValue.driver_id.includes(o.d_driver_info.nickname));
            const resultId = []
            filterName.forEach(item => {
              resultId.push(item.id)
            })
            fieldsValue.driver_id = resultId
          }
          const addValues = {
            ...fieldsValue,
            gps: this.state.gps.join(','),
          };
          this.setState({
            formValues: addValues,
          });
          console.log('addValues', addValues);
          this.accessCardWrite('accessCard/fetchAccessCardAdd', addValues);
        }
      } else {
        message.error('表单尚未填写完，请检查。');
      }
    });
  };

  handleUploadChange = info => {
    const {
      common: { commonConfig },
      form,
    } = this.props;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    if (beforeUpload(info.file)) {
      uploadImage(formData).then(res => {
        if (res && res.code == 200) {
          this.setState(
            {
              // logoUrl: commonConfig.image_domain + res.data.items.path,
              logoUrl: res.data.items.path,
              uploadLoading: false,
            },
            () => {
              form.setFieldsValue({
                logo: this.state.logoUrl,
              });
            }
          );
          console.log(this.state.logoUrl);
        }
      });
    } else {
      this.setState({ uploadLoading: false });
    }


  };

  // 初始化地图
  apiIsLoaded = (map, maps) => {
    // console.log(map, maps);
    const { gps, editStatus, center } = this.state
    Maps = maps;
    console.log(gps);
    if (editStatus) {
      //获取地图数据
      this.initMap({
        'lng': gps[0],
        'lat': gps[1],
      });
    } else {
      this.initMap(center);
    }
  };
  initMap = (LatLng) => {
    const { gps, editStatus, center } = this.state

    if (!LatLng.lat || !LatLng.lng) {
      LatLng = center;
    }
    this.setState({
      gps: [...[LatLng.lng, LatLng.lat]]
    })
    console.log(LatLng)

    if (!Maps) return;
    // 谷歌地图显示
    var myLatlng = new Maps.LatLng(LatLng.lat, LatLng.lng);

    var mapOptions = {
      zoom: 8,
      center: myLatlng
    }

    map = new Maps.Map(document.getElementById("map"), mapOptions);

    // 显示定位点
    var marker = new Maps.Marker({
      position: myLatlng,
      map: map,
      draggable: true,
    });

    // this.setState({
    //   gps: [...[myLatlng.lng, myLatlng.lat]]
    // }, () => {
    //   console.log('initMapgps',gps)
    // })

    // map.addListener(marker, 'dragend')
    marker.addListener('dragend', this.onDragEnd);
  };

  onDragEnd = (data) => {
    const { gps, center } = this.state

    let gpsLatLng = data.latLng.lng() + ',' + data.latLng.lat();
    // console.log(lng, lat);
    this.setState({
      gps: [...gpsLatLng.split(",")]
    }, () => {
      console.log('onDragEndgps', gps)
    })
  }

  searchGeocoding = () => {
    const { form } = this.props;
    let content = form.getFieldValue('address') || '';
    if (content == '') {
      return message.error('请输入内容！');
    }
    if (!content) return message.info("请输入赌场地址");
    let geocoder = new Maps.Geocoder();
    geocoder.geocode({ 'address': content }, (results, status) => {
      if (status == 'OK') {
        let gps = results[0].geometry.location
        this.initMap({
          lng: gps.lng(),
          lat: gps.lat()
        })
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  // 新增的骑手多选

  // 请求骑手列表
  // getDriverFn = () => {
  //   getDriver().then(res => {
  //     if (!utils.successReturn(res)) return;
  //     const newArr = []
  //     res.data.items.forEach(item => {
  //       newArr.push(item)
  //     })
  //     this.setState({
  //       driverIdList: newArr,
  //       selectedItems: newArr
  //     })
  //   })
  // }

  getDriverFn = () => {
    getDriver().then(res => {
      if (!utils.successReturn(res)) return;
      const newArr = []
      const data = [];
      res.data.items.forEach(item => {
        newArr.push(item)
        data.push({
          value: item.d_driver_info.driver_id,
          text: item.d_driver_info.nickname,
        });
      })
      this.setState({
        driverIdList: newArr,
        selectedItems: newArr,
        driverIdData: data
      })
    })
  }


  // 单选点击也请求骑手列表，展示数据
  onFocusGetDriverList = (value) => {
    value = undefined;
    getDriver().then(res => {
      if (!utils.successReturn(res)) return;
      const result = res.data.items;
      const data = [];
      result.forEach(r => {
        data.push({
          value: r.d_driver_info.driver_id,
          text: r.d_driver_info.nickname,
        });
      });
      this.setState({ driverIdData: data })
    })
  }


  // 编辑的骑手单选 骑手数据
  getDriverList = (value, callback) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    let numExg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/

    if (numExg.test(value)) {
      getDriver({
        mobile: value,
      }).then(res => {
        if (!utils.successReturn(res)) return;
        // console.log('骑手数据', res.data.items)
        if (currentValue === value) {
          const result = res.data.items;
          const data = [];
          if (result != undefined) {
            result.forEach(r => {
              data.push({
                value: r.d_driver_info.driver_id,
                text: r.d_driver_info.nickname,
              });
            });
          }
          callback(data);
        }
      })

    } else {
      getDriver({
        nickname: value,
      }).then(res => {
        if (!utils.successReturn(res)) return;
        if (currentValue === value) {
          const result = res.data.items;
          const data = [];
          if (result != undefined) {
            result.forEach(r => {
              data.push({
                value: r.d_driver_info.driver_id,
                text: r.d_driver_info.nickname,
              });
            });
          }

          callback(data);
        }
      })
    }

    timeout = setTimeout(getDriver, 300);
  }

  // 模糊筛选骑手
  handleDriverSearch = value => {
    if (value) {
      this.getDriverList(value, driverIdData => this.setState({ driverIdData }));
    } else {
      this.setState({ driverIdData: [] });
    }
  };

  handleDriverChange = value => {
    this.setState({ value });
  };

  render () {
    const {
      uploadLoading,
      logoUrl,
      imageUrl,
      urlTypeView,
      formValues,
      submitLoading,
      editStatus,
    } = this.state;
    const {
      list: { list },
      form,
      common,
      loading,
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

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    // 模糊筛选骑手
    const options = this.state.driverIdData.map(d => <Option key={d.value} value={d.value}>{d.text}</Option>);

    const { selectedItems } = this.state;
    const filteredOptions = this.state.driverIdList.filter(o => !selectedItems.includes(o.d_driver_info.nickname));

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
            />{' '}
            {!editStatus ? '新增出入证' : '编辑出入证'}
          </span>
        </div>
        <Form>
          <FormItem {...formLayout} label="启用状态">
            {getFieldDecorator('status', {
              rules: [{ required: true, message: '必填' }],
              initialValue: this.state.formValues.status ? this.state.formValues.status : 1,
            })(
              <Radio.Group>
                <Radio value={1}>启动</Radio>
                <Radio value={2}>禁用</Radio>
              </Radio.Group>
            )}
          </FormItem>
          {/* extra="支持.png .jpg格式,大小限制300K以内" */}
          <FormItem
            {...formLayout}
            label="赌场LOGO"
          >
            {getFieldDecorator('logo', {
              rules: [{ required: true, message: '请上传LOGO' }],
            })(
              <Upload
                name="banner"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {
                  return false;
                }}
                onChange={info => {
                  this.handleUploadChange(info);
                }}
                accept="image/png, image/jpeg, image/jpg"
              >
                {logoUrl || this.state.formValues.logo ? (
                  <ShowImg src={logoUrl || this.state.formValues.logo} className="avatar-80" />
                ) : (
                    uploadButton
                  )}
              </Upload>
            )}
          </FormItem>
          <FormItem {...formLayout} label="赌场名称">
            {getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文赌场名称">
            {getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文赌场名称">
            {getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="赌场地址">
            {getFieldDecorator('address', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <div className="dynamic-button" style={{ right: '-80px', top: '-15px' }}>
              <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
            </div>
          </FormItem>
          <FormItem {...submitFormLayout}>
            <div id="map" className="map_box" style={{ width: '100%', height: 430 }} ref="mapBox" >
              <GoogleMapReact
                bootstrapURLKeys={{ key: configVar.google_api_key }}
                defaultCenter={this.state.center}
                defaultZoom={10}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => this.apiIsLoaded(map, maps)}
              >
              </GoogleMapReact>
            </div>
            {/* {!editStatus ? (<div id="map" className="map_box" style={{ width: '100%', height: 430 }} ref="mapBox" >
              <GoogleMapReact
                bootstrapURLKeys={{ key: configVar.google_api_key }}
                defaultCenter={this.state.center}
                defaultZoom={10}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => this.apiIsLoaded(map, maps)}
              >
              </GoogleMapReact>
            </div>) : (<div>编辑的时候的地图</div>)} */}
          </FormItem>
          <FormItem {...formLayout} label="公司名称">
            {getFieldDecorator('company_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'company') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文公司名称">
            {getFieldDecorator('company_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文公司名称">
            {getFieldDecorator('company_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>

          <FormItem {...formLayout} label="有效时间">
            {!editStatus ? (
              <div>{getFieldDecorator('range_picker_add', {
                rules: [{ required: true, message: '请选择有效时间' }],
              })(<RangePicker />)}</div>
            ) : (
                <div>{getFieldDecorator('range_picker', {
                  initialValue: [
                    moment.unix(this.state.formValues.start_time),
                    moment.unix(this.state.formValues.end_time),
                  ],
                  rules: [{ required: true, message: '请选择有效时间' }],
                })(<RangePicker />)}</div>
              )}
          </FormItem>

          {/* value={selectedItems} */}
          {!editStatus ? (<FormItem {...formLayout} label="选择骑手">
            {getFieldDecorator('driver_id', {
              rules: [{ required: true, message: '必填' }],
            })(
              <Select
                mode="multiple"
                placeholder="请选择骑手"
                value={selectedItems}
                onChange={this.handleSelectedChange}
                style={{ width: '100%' }}
                allowClear
              >
                {filteredOptions.map(item => (
                  <Select.Option key={item.id} value={item.d_driver_info.nickname}>
                    {item.d_driver_info.nickname}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>) : (<FormItem {...formLayout} label="选择骑手">
            {getFieldDecorator('driver_id', {
              rules: [{ required: true, message: '必填' }],
              initialValue: this.state.formValues.driver_id
            })(
              <Select
                showSearch
                placeholder={this.props.placeholder}
                style={this.props.style}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={val => {
                  this.handleDriverSearch(val);
                }}
                onFocus={val => { this.onFocusGetDriverList(val) }}
                onChange={val => {
                  this.handleDriverChange(val);
                }}
                notFoundContent={null}
              >
                {options}
              </Select>
            )}
          </FormItem>)}


          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            {!editStatus ? (
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.saveForm}
                loading={submitLoading}
              >
                保存
              </Button>
            ) : (
                <Button type="primary" htmlType="submit" onClick={this.saveForm} loading={submitLoading}>
                  保存编辑
              </Button>
              )}
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                router.goBack();
              }}
            >
              <FormattedMessage id="form.cancel" />
            </Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

export default AccessCardCreate;
