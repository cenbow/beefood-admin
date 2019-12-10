import { stringify } from 'qs';
import request from '@/utils/request';

// 国家数据
export async function getCountry(params) {
  return request(`/common/country?${stringify(params)}`);
}

// 城市数据
export async function getCity(params) {
  return request(`/common/city?${stringify(params)}`);
}

// 区域数据
export async function getRegion(params) {
  return request(`/common/region?${stringify(params)}`);
}

// 商圈数据
export async function getBusiness(params) {
  return request(`/common/business?${stringify(params)}`);
}

// 站点数据
export async function getStation(params) {
  return request(`/common/station?${stringify(params)}`);
}

// BD管理人员正常的商圈数据
export async function getBdManagerBusiness(params) {
  return request(`/common/bdManagerBusiness?${stringify(params)}`);
}

// BD管理人员数据
export async function getBdManager(params) {
  return request(`/common/bdManager?${stringify(params)}`);
}

// BD人员数据
export async function getBdListForForm(params) {
  return request(`/common/bdListForForm?${stringify(params)}`);
}

// 用户数据
export async function getUser(params) {
  return request(`/common/user?${stringify(params)}`);
}

// 商家数据
export async function getMerchant(params) {
  return request(`/common/merchant?${stringify(params)}`);
}

// 商家商品数据
export async function getMerchantDish(params) {
  return request(`/common/merchantDish?${stringify(params)}`);
}

// 专题数据
export async function getSubject(params) {
  return request(`/common/subject?${stringify(params)}`);
}

// 商家分类数据
export async function getMCategory(params) {
  return request(`/common/mCategory?${stringify(params)}`);
}

// 商家分类分级数据
export async function getLevelMCategory(params) {
  return request(`/common/levelMCategory?${stringify(params)}`);
}

// 上传图片
export async function uploadImage(params) {
  return request('/common/uploadImage', {
    method: 'POST',
    body: params,
  });
}

//获取网站相关配置
export async function getCommonConfig() {
  return request('/common/config');
}
//获取侧边栏模块获取
export async function getPermissionList() {
  return request(`/permission/module/list`);
}

//站长数据
export async function getStationAgent() {
  return request('/common/stationAgent');
}

// 骑手数据
export async function getDriver(params) {
  return request(`/common/driver?${stringify(params)}`);
}

// 谷歌翻译接口
export async function getTranslate(params) {
  return request('/common/translate/google', {
    method: 'POST',
    body: params,
  });
}

//获取评价标签数据
export async function getDriverEvaluateLabel(params) {
  return request('/common/driverEvaluateLabel');
}
