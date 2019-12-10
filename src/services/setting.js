import { stringify } from 'qs';
import request from '@/utils/request';

// 获取管理员列表
export async function getManagerList(params) {
  return request(`/admin/list?${stringify(params)}`);
}
// 获取管理员新增
export async function managerSend(params) {
  return request('/admin/create', {
    method: 'POST',
    body: params,
  });
}
//获取管理员修改
export async function managerEdit(params) {
  return request('/admin/edit', {
    method: 'POST',
    body: params,
  });
}
// 获取管理员详情
export async function getManagerDetail(params) {
  return request(`/manager/detail?${stringify(params)}`);
}
//获取管理员信息
export async function getManagerInfo(params) {
  return request(`/admin/info?${stringify(params)}`);
}
//删除管理员
export async function getManagerDelete(params) {
  return request('/admin/delete', {
    method: 'POST',
    body: params,
  });
}
//改变管理员状态
export async function getManagerStatus(params) {
  return request('/admin/status', {
    method: 'POST',
    body: params,
  });
}
// 获取角色列表
export async function getRoleList(params) {
  return request(`/role/list?${stringify(params)}`);
}
// 获取角色新增
export async function roleCreate(params) {
  return request('/role/create', {
    method: 'POST',
    body: params,
  });
}
// 获取角色修改
export async function roleEdit(params) {
  return request('/role/edit', {
    method: 'POST',
    body: params,
  });
}
// 获取角色详情
export async function getRoleDetail(params) {
  return request(`/role/info?${stringify(params)}`);
}
// 角色权限列表
export async function getRolePermissions(params) {
  return request(`/role/permissions?${stringify(params)}`);
}
//角色权限授权
export async function getRoleAuthorise(params) {
  return request('/role/authorise', {
    method: 'POST',
    body: params,
  });
}
//删除角色
export async function getRoleDelete(params) {
  return request('/role/delete', {
    method: 'POST',
    body: params,
  });
}
//获取权限列表
export async function getPermissionList() {
  return request(`/permission/list`);
}
//删除权限
export async function getPermissionDelete(params) {
  return request('/permission/delete', {
    method: 'POST',
    body: params,
  });
}
//创建权限
export async function getPermissionCreate(params) {
  return request('/permission/create', {
    method: 'POST',
    body: params,
  });
}
//修改权限
export async function getPermissionEdit(params) {
  return request('/permission/edit', {
    method: 'POST',
    body: params,
  });
}
