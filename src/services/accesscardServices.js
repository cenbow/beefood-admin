import { stringify } from 'qs';
import request from '@/utils/request';

// 出入证管理列表
export async function getAccessCardList(params) {
  return request(`/accessCard/list?${stringify(params)}`);
}

// 新增出入证
export async function addAccessCard(params) {
  return request('/accessCard/add', {
    method: 'POST',
    body: params,
  });
}

// 删除出入证
export async function deleteAccessCard(params) {
  return request('/accessCard/delete', {
    method: 'POST',
    body: params,
  });
}

// 获取出入证详情
export async function getAccessCardInfo(params) {
  return request(`/accessCard/info?${stringify(params)}`);
}

// 更新出入证
export async function editAccessCard(params) {
  return request('/accessCard/edit', {
    method: 'POST',
    body: params,
  });
}
