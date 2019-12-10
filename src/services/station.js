import { stringify } from 'qs';
import request from '@/utils/request';

// 站点列表
export async function getStationList(params) {
  return request(`/station?${stringify(params)}`);
}

// 编辑页信息
export async function getStationInfo(params) {
  return request(`/station/info?${stringify(params)}`);
}

// 站点详情
export async function getStationDetail(params) {
  return request(`/station/detail?${stringify(params)}`);
}

// 添加/修改站点
export async function saveStation(params) {
  return request('/station/add', {
    method: 'POST',
    body: params,
  });
}
export async function editStation(params) {
  return request('/station/edit', {
    method: 'POST',
    body: params,
  });
}

// 删除站点
export async function deleteStation(params) {
  return request('/station/delete', {
    method: 'POST',
    body: params,
  });
}

// 站点详情-骑手取件范围
export async function takeRange(params) {
  return request('/station/takeRange', {
    method: 'POST',
    body: params,
  });
}