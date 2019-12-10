import { stringify } from 'qs';
import request from '@/utils/request';

// 列表
export async function getStationAgent(params) {
  return request(`/stationAgent?${stringify(params)}`);
}

// 编辑页信息
export async function getStationAgentInfo(params) {
  return request(`/stationAgent/info?${stringify(params)}`);
}

// 详情
export async function getStationAgentDetail(params) {
  return request(`/stationAgent/detail?${stringify(params)}`);
}

// 添加/修改
export async function saveStationAgent(params) {
  return request('/stationAgent/add', {
    method: 'POST',
    body: params,
  });
}
export async function editStationAgent(params) {
  return request('/stationAgent/edit', {
    method: 'POST',
    body: params,
  });
}

// 删除
export async function deleteStationAgent(params) {
  return request('/stationAgent/delete', {
    method: 'POST',
    body: params,
  });
}

// 详情-骑手列表
export async function getStationAgentDriverList(params) {
  return request(`/stationAgent/driverList?${stringify(params)}`);
}