import { stringify } from 'qs';
import request from '@/utils/request';

// 获取国家数据
export async function getCountry(params) {
  return request(`/business/country?${stringify(params)}`);
}
// 国家详情页信息
export async function getCountryInfo(params) {
  return request(`/business/country/info?${stringify(params)}`);
}
// 添加/修改国家
export async function saveCountry(params) {
  return request('/business/country/add', {
    method: 'POST',
    body: params,
  });
}
export async function editCountry(params) {
  return request('/business/country/edit', {
    method: 'POST',
    body: params,
  });
}
// 删除国家
export async function deleteCountry(params) {
  return request('/business/country/delete', {
    method: 'POST',
    body: params,
  });
}


// 获取城市数据
export async function getCity(params) {
  return request(`/business/city?${stringify(params)}`);
}
// 城市详情页信息
export async function getCityInfo(params) {
  return request(`/business/city/info?${stringify(params)}`);
}
// 添加/修改城市
export async function saveCity(params) {
  return request('/business/city/add', {
    method: 'POST',
    body: params,
  });
}
export async function editCity(params) {
  return request('/business/city/edit', {
    method: 'POST',
    body: params,
  });
}
// 删除城市
export async function deleteCity(params) {
  return request('/business/city/delete', {
    method: 'POST',
    body: params,
  });
}


// 获取区域数据
export async function getRegion(params) {
  return request(`/business/region?${stringify(params)}`);
}
// 区域编辑页信息
export async function getRegionInfo(params) {
  return request(`/business/region/info?${stringify(params)}`);
}
// 添加/修改区域
export async function saveRegion(params) {
  return request('/business/region/add', {
    method: 'POST',
    body: params,
  });
}
export async function editRegion(params) {
  return request('/business/region/edit', {
    method: 'POST',
    body: params,
  });
}
// 删除区域
export async function deleteRegion(params) {
  return request('/business/region/delete', {
    method: 'POST',
    body: params,
  });
}
// 区域详情页信息
export async function getRegionDetail(params) {
  return request(`/business/region/detail?${stringify(params)}`);
}


// 获取商圈数据
export async function getBusiness(params) {
  return request(`/business?${stringify(params)}`);
}
// 商圈编辑页信息
export async function getBusinessInfo(params) {
  return request(`/business/info?${stringify(params)}`);
}
// 商圈详情页信息
export async function getBusinessDetail(params) {
  return request(`/business/detail?${stringify(params)}`);
}
// 添加/修改商圈
export async function saveBusiness(params) {
  return request('/business/add', {
    method: 'POST',
    body: params,
  });
}
export async function editBusiness(params) {
  return request('/business/edit', {
    method: 'POST',
    body: params,
  });
}
// 删除商圈
export async function deleteBusiness(params) {
  return request('/business/delete', {
    method: 'POST',
    body: params,
  });
}