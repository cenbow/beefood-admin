import { stringify } from 'qs';
import request from '@/utils/request';

// BD管理人员商圈列表-我的商圈
export async function getManagerBusiness(params) {
  return request(`/bd/managerBusiness?${stringify(params)}`);
}

// BD管理人员-我的商圈-添加商圈
export async function saveManagerBusiness(params) {
  return request('/bd/managerBusiness/add', {
    method: 'POST',
    body: params,
  });
}

// BD管理人员-我的商圈-删除商圈
export async function deleteManagerBusiness(params) {
  return request('/bd/managerBusiness/delete', {
    method: 'POST',
    body: params,
  });
}

// 超级管理员/BD负责人-添加BD人员
export async function saveBd(params) {
  return request('/bd/add', {
    method: 'POST',
    body: params,
  });
}
//超级管理员/BD负责人-修改BD人员
export async function editBd(params) {
  return request('/bd/edit', {
    method: 'POST',
    body: params,
  });
}

// 超级管理员/BD负责人-删除BD人员
export async function deleteBd(params) {
  return request('/bd/delete', {
    method: 'POST',
    body: params,
  });
}

// 超级管理员/BD负责人-编辑时删除BD人员的商圈
export async function deleteBdBusiness(params) {
  return request('/bd/deleteBusiness', {
    method: 'POST',
    body: params,
  });
}

// BD人员列表
export async function getBdList(params) {
  return request(`/bd?${stringify(params)}`);
}

// BD人员详情
export async function getBdDetail(params) {
  return request(`/bd/detail?${stringify(params)}`);
}

//BD人员编辑页面信息
export async function getBdInfo(params) {
  return request(`/bd/info?${stringify(params)}`);
}
