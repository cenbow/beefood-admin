import { stringify } from 'qs';
import request from '@/utils/request';

// 文章配置获取
export async function getPage (params) {
  return request(`/platformSet/page/info?${stringify(params)}`);
}
// 文章配置修改
export async function getPageEdit (params) {
  return request('/platformSet/page/edit', {
    method: 'POST',
    body: params,
  });
}

// 获取红包管理列表
export async function getPromotionList (params) {
  return request(`/platformSet/redPacket?${stringify(params)}`);
}

// 红包发放
export async function redpacketSend (params) {
  return request('/platformSet/redPacket/save', {
    method: 'POST',
    body: params,
  });
}

// 删除红包
export async function redpacketDelete (params) {
  return request('/platformSet/redPacket/delete', {
    method: 'POST',
    body: params,
  });
}

// 获取红包详情
// 函数名字冲突
// export async function getRedpacketDetail (params) {
//   return request(`/redpacket/detail?${stringify(params)}`);
export async function getRedpacketDetail (params) {
  return request(`/platformSet/redPacket/detail?${stringify(params)}`);
}

// 根据系统红包ID 获取用户领取列表
export async function getRedpacketUserList (params) {
  return request(`/platformSet/redPacket/userTakeList?${stringify(params)}`);
}

// 获取区域管理员列表
export async function getRegionList (params) {
  return request(`/region/getList?${stringify(params)}`);
}
// 获取区域管理员详情
export async function getRegionDetail (params) {
  return request(`/region/detail?${stringify(params)}`);
}

// 平台配置--商品分类
export async function getClassifyList (params) {
  return request(`/platformSet/mCategory?${stringify(params)}`);
}
export async function addClassify (params) {
  return request('/platformSet/mCategory/add', {
    method: 'POST',
    body: params,
  });
}
export async function editClassify (params) {
  return request('/platformSet/mCategory/edit', {
    method: 'POST',
    body: params,
  });
}
export async function getClassifyInfo (params) {
  return request(`/platformSet/mCategory/info?${stringify(params)}`);
}
export async function deleteClassify (params) {
  return request('/platformSet/mCategory/delete', {
    method: 'POST',
    body: params,
  });
}

//配送设置
export async function getCityDeliveryList (params) {
  return request(`/platformSet/cityDelivery?${stringify(params)}`);
}
export async function addCityDelivery (params) {
  return request('/platformSet/cityDelivery/add', {
    method: 'POST',
    body: params,
  });
}
export async function editCityDelivery (params) {
  return request('/platformSet/cityDelivery/edit', {
    method: 'POST',
    body: params,
  });
}
export async function getCityDeliveryInfo (params) {
  return request(`/platformSet/cityDelivery/info?${stringify(params)}`);
}
export async function deleteCityDelivery (params) {
  return request('/platformSet/cityDelivery/delete', {
    method: 'POST',
    body: params,
  });
}

// 广告设置  
export async function getBannerList (params) {
  return request(`/platformSet/banner?${stringify(params)}`);
}
export async function addBanner (params) {
  return request('/platformSet/banner/add', {
    method: 'POST',
    body: params,
  });
}
export async function editBanner (params) {
  return request('/platformSet/banner/edit', {
    method: 'POST',
    body: params,
  });
}
export async function getBannerInfo (params) {
  return request(`/platformSet/banner/info?${stringify(params)}`);
}

export async function deleteBanner (params) {
  return request('/platformSet/banner/delete', {
    method: 'POST',
    body: params,
  });
}
export async function enableBanner (params) {
  return request('/platformSet/banner/enable', {
    method: 'POST',
    body: params,
  });
}
export async function disableBanner (params) {
  return request('/platformSet/banner/disable', {
    method: 'POST',
    body: params,
  });
}

// 分享设置-信息页面
export async function getShareSetInfo (params) {
  return request(`/platformSet/shareSetInfo?${stringify(params)}`);
}

// 修改分享设置
export async function editShareSet (params) {
  return request('/platformSet/shareSetEdit', {
    method: 'POST',
    body: params,
  });
}


// 专题设置-列表
export async function getSubjectList (params) {
  return request(`/platformSet/subject?${stringify(params)}`);
}

export async function addSubject (params) {
  return request('/platformSet/subject/add', {
    method: 'POST',
    body: params,
  });
}
export async function editSubject (params) {
  return request('/platformSet/subject/edit', {
    method: 'POST',
    body: params,
  });
}
export async function getSubjectInfo (params) {
  return request(`/platformSet/subject/info?${stringify(params)}`);
}

export async function deleteSubject (params) {
  return request('/platformSet/subject/delete', {
    method: 'POST',
    body: params,
  });
}
export async function enableSubject (params) {
  return request('/platformSet/subject/enable', {
    method: 'POST',
    body: params,
  });
}
export async function disableSubject (params) {
  return request('/platformSet/subject/disable', {
    method: 'POST',
    body: params,
  });
}


// 更新设置
export async function getUpdateSetInfo (params) {
  return request(`/platformSet/updateSetInfo?${stringify(params)}`);
}
export async function editUpdateSet (params) {
  return request('/platformSet/updateSetEdit', {
    method: 'POST',
    body: params,
  });
}


// 地图设置
export async function getMapSetInfo (params) {
  return request(`/platformSet/mapSetInfo?${stringify(params)}`);
}
export async function editMapSet (params) {
  return request('/platformSet/mapSetEdit', {
    method: 'POST',
    body: params,
  });
}


// 新用户领取红包背景设置
export async function getUserRedPacketSetInfo (params) {
  return request(`/platformSet/userGetRedPacketBgSetInfo?${stringify(params)}`);
}
export async function editUserRedPacketSet (params) {
  return request('/platformSet/userGetRedPacketSetEdit', {
    method: 'POST',
    body: params,
  });
}


// 风控参数设置

export async function getRiskParamSetInfo (params) {
  return request(`/platformSet/riskParamSetInfo?${stringify(params)}`);
}
export async function editRiskParamSet (params) {
  return request('/platformSet/riskParamSetEdit', {
    method: 'POST',
    body: params,
  });
}

// 热门搜索
export async function getHotSearchInfo (params) {
  return request(`/platformSet/hotSearchInfo?${stringify(params)}`);
}
export async function editHotSearch (params) {
  return request('/platformSet/hotSearchEdit', {
    method: 'POST',
    body: params,
  });
}



// 首页商家分类管理
export async function getIndexMCategoryList (params) {
  return request(`/platformSet/indexMCategory?${stringify(params)}`);
}

export async function addIndexMCategory (params) {
  return request('/platformSet/indexMCategory/add', {
    method: 'POST',
    body: params,
  });
}
export async function deleteIndexMCategory (params) {
  return request('/platformSet/indexMCategory/delete', {
    method: 'POST',
    body: params,
  });
}