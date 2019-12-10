import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Alert, Button, Modal, message } from 'antd';
import utils from '@/utils/utils';
import Zmage from 'react-zmage';
import styles from './index.less';
import DealAudit from './DealAudit';

@connect(({ merchant, common, loading }) => ({
  basicInfo: merchant.basicInfo,
  image_domain: common.commonConfig.image_domain,
  common,
  loading: loading.effects['merchant/fetchBasicInfo'],
}))
class BasicInfo extends Component {
  state ={
    merchant_id: '',
    info_verify_type: '1',
    modalVisible: false,
    infoData: {},
    newInfoData: {},
  }

  componentDidMount(){
    const { match } = this.props;
    this.getCommon();
    this.setState({
      merchant_id: match.params.id,
    }, () => {
        this.getInfo()
    });
  }

  getInfo = () => {
    const { dispatch } = this.props;
    // 获取认证状态信息
    dispatch({
      type: 'merchant/fetchBasicInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        this.setState({
          infoData: data,
        });
        if (data.verify_data){
          this.setState({
            newInfoData: data.verify_data,
          });
        }
        // console.log(JSON.stringify(res.data.items));
        
      }
    });
  }

  getCommon = () => {
    const { dispatch } = this.props;
    // 选择国家
    dispatch({
      type: 'common/getCountry',
      payload: {}
    });
    // 选择城市
    dispatch({
      type: 'common/getCity',
      payload: {}
    });
    // 选择区域
    dispatch({
      type: 'common/getRegion',
      payload: {}
    });
    // 选择商圈
    dispatch({
      type: 'common/getBusiness',
      payload: {}
    });
  }

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

  selectName = (data,id) => {
    // console.log(data,id);
    let name = '';
    data.forEach(el => {
      if (el.id == id) {
        name = el.name;
      }
    });
    return name;
  }

  render() {
    const { modalVisible, infoData, newInfoData } = this.state;
    const { image_domain, loading, common } = this.props;
    const { country = [], city = [], region = [], business = [] } = common;

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
                  <dl className="common_dl">
                    <dt className="common_dl_dt_140"><span>商家登录手机号</span>：</dt>
                    <dd className="common_dl_dd_140">{'+' + infoData.mobile_prefix + ' '}{infoData.mobile}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.logo, newInfoData.logo)}`}>
                    <dt className="common_dl_dt_140"><span>店铺头像</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        <li>
                          <Zmage
                            src={image_domain + infoData.m_user_info.logo}
                            style={{ width: '82px', height: '82px', }}
                          />
                        </li>
                      </ul>
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.background_image, newInfoData.background_image)}`}>
                    <dt className="common_dl_dt_140"><span>店铺招牌</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        <li>
                          <Zmage
                            src={image_domain + infoData.m_user_info.background_image}
                            style={{ width: '82px', height: '82px', }}
                          />
                        </li>
                      </ul>
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.name_cn, newInfoData.name_cn)}`}>
                    <dt className="common_dl_dt_140"><span>商家名称</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.m_user_info.name_cn}</dd>
                  </dl>
                  <dl className="common_dl">
                    <dt className="common_dl_dt_140"><span>店铺ID</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.m_user_info.merchant_id}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, JSON.stringify(infoData.category), JSON.stringify(newInfoData.category))}`}>
                    <dt className="common_dl_dt_140"><span>商家分类</span>：</dt>
                    <dd className="common_dl_dd_140">
                      {
                        (infoData.category || []).map((item, i) => {
                          if (i != 0) {
                            return (
                              <span key={i}>，{item.category_one_name}-{item.category_two_name}-{item.category_three_name}</span>
                            );
                          }
                          return (
                            <span key={i}>{item.category_one_name}-{item.category_two_name}-{item.category_three_name}</span>
                          );
                        })
                      }
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.country_id, newInfoData.country_id)}`}>
                    <dt className="common_dl_dt_140"><span>国家</span>：</dt>
                    <dd className="common_dl_dd_140">{country.length > 0 && this.selectName(country, infoData.m_user_info.country_id)}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.city_id, newInfoData.city_id)}`}>
                    <dt className="common_dl_dt_140"><span>所属城市</span>：</dt>
                    <dd className="common_dl_dd_140">{city.length > 0 && this.selectName(city, infoData.m_user_info.city_id)}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.region_id, newInfoData.region_id)}`}>
                    <dt className="common_dl_dt_140"><span>所属区域</span>：</dt>
                    <dd className="common_dl_dd_140">{region.length > 0 && this.selectName(region, infoData.m_user_info.region_id)}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.business_id, newInfoData.business_id)}`}>
                    <dt className="common_dl_dt_140"><span>所属商圈</span>：</dt>
                    <dd className="common_dl_dd_140">{business.length > 0 && this.selectName(business, infoData.m_user_info.business_id)}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.address_cn, newInfoData.address_cn)}`}>
                    <dt className="common_dl_dt_140"><span>详细地址</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.m_user_info.address_cn}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.contact_name, newInfoData.contact_name)}`}>
                    <dt className="common_dl_dt_140"><span>商家联系人</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.m_user_info.contact_name}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.store_mobile, newInfoData.store_mobile)}`}>
                    <dt className="common_dl_dt_140"><span>联系电话</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.m_user_info.store_mobile}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.order_mobile, newInfoData.order_mobile)}`}>
                    <dt className="common_dl_dt_140"><span>订餐电话</span>：</dt>
                    <dd className="common_dl_dd_140">
                      {
                        (infoData.m_user_info.order_mobile || []).map((item, i) => (
                          i != 0 ? (<span key={i}>/{item}</span>) : (<span key={i}>{item}</span>)
                        ))
                      }
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.desc_cn, newInfoData.desc_cn)}`}>
                    <dt className="common_dl_dt_140"><span>商家简介</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.m_user_info.desc_cn}</dd>
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
                        <dl className="common_dl">
                          <dt className="common_dl_dt_140"><span>商家登录手机号</span>：</dt>
                          <dd className="common_dl_dd_140">{'+' + infoData.mobile_prefix + ' '}{infoData.mobile}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.logo, newInfoData.logo)}`}>
                          <dt className="common_dl_dt_140"><span>店铺头像</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              <li>
                                <Zmage
                                  src={image_domain + newInfoData.logo}
                                  style={{ width: '82px', height: '82px', }}
                                />
                              </li>
                            </ul>
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.background_image, newInfoData.background_image)}`}>
                          <dt className="common_dl_dt_140"><span>店铺招牌</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              <li>
                                <Zmage
                                  src={image_domain + newInfoData.background_image}
                                  style={{ width: '82px', height: '82px', }}
                                />
                              </li>
                            </ul>
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.name_cn, newInfoData.name_cn)}`}>
                          <dt className="common_dl_dt_140"><span>商家名称</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.name_cn}</dd>
                        </dl>
                        <dl className="common_dl">
                          <dt className="common_dl_dt_140"><span>店铺ID</span>：</dt>
                          <dd className="common_dl_dd_140">{infoData.m_user_info.merchant_id}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, JSON.stringify(infoData.category), JSON.stringify(newInfoData.category))}`}>
                          <dt className="common_dl_dt_140"><span>商家分类</span>：</dt>
                          <dd className="common_dl_dd_140">
                            {
                              (newInfoData.category || []).map((item, i) => {
                                if (i != 0) {
                                  return (
                                    <span key={i}>，{item.category_one_name}-{item.category_two_name}-{item.category_three_name}</span>
                                  );
                                }
                                return (
                                  <span key={i}>{item.category_one_name}-{item.category_two_name}-{item.category_three_name}</span>
                                );
                              })
                            }
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.country_id, newInfoData.country_id)}`}>
                          <dt className="common_dl_dt_140"><span>国家</span>：</dt>
                          <dd className="common_dl_dd_140">{country.length > 0 && this.selectName(country, newInfoData.country_id)}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.city_id, newInfoData.city_id)}`}>
                          <dt className="common_dl_dt_140"><span>所属城市</span>：</dt>
                          <dd className="common_dl_dd_140">{city.length > 0 && this.selectName(city, newInfoData.city_id)}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.region_id, newInfoData.region_id)}`}>
                          <dt className="common_dl_dt_140"><span>所属区域</span>：</dt>
                          <dd className="common_dl_dd_140">{region.length > 0 && this.selectName(region, newInfoData.region_id)}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.business_id, newInfoData.business_id)}`}>
                          <dt className="common_dl_dt_140"><span>所属商圈</span>：</dt>
                          <dd className="common_dl_dd_140">{business.length > 0 && this.selectName(business, newInfoData.business_id)}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.address_cn, newInfoData.address_cn)}`}>
                          <dt className="common_dl_dt_140"><span>详细地址</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.address_cn}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.contact_name, newInfoData.contact_name)}`}>
                          <dt className="common_dl_dt_140"><span>商家联系人</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.contact_name}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.store_mobile, newInfoData.store_mobile)}`}>
                          <dt className="common_dl_dt_140"><span>联系电话</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.store_mobile}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.order_mobile, newInfoData.order_mobile)}`}>
                          <dt className="common_dl_dt_140"><span>订餐电话</span>：</dt>
                          <dd className="common_dl_dd_140">
                            {
                              (newInfoData.order_mobile || []).map((item, i) => (
                                i != 0 ? (<span key={i}>/{item}</span>) : (<span key={i}>{item}</span>)
                              ))
                            }
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.m_user_info.desc_cn, newInfoData.desc_cn)}`}>
                          <dt className="common_dl_dt_140"><span>商家简介</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.desc_cn}</dd>
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

export default BasicInfo;