import {stringify} from 'qs';
import request from '@/utils/request';

// 获取用户列表
export async function queryMemberConsumer(params) {
  return request(`/user/list?${stringify(params)}`);
}

// 用户信息添加
export async function memberConsumerAdd(params) {
  return request('/user/add', {
    method: 'POST',
    body: params,
  });
}

// 用户信息修改
export async function memberConsumerUpdate(params) {
  return request('/user/edit', {
    method: 'POST',
    body: params,
  });
}

// 用户信息删除
export async function memberConsumerDelete(params) {
  return request('/user/delete', {
    method: 'POST',
    body: params,
  });
}

// 获取用户详情信息
export async function queryMemberConsumerInfo(params) {
  return request(`/user/info?${stringify(params)}`);
}

//用户红包列表
export async function getBonusValueList(params) {
  return request(`/user/redpacket/list?${stringify(params)}`);
}

//用户红包详情
export async function bonusValueInfo(params) {
  return request(`/user/redpacket/info?${stringify(params)}`);
}

//用户红包删除
export async function bonusValueDelete(params) {
  return request('/user/redpacket/delete', {
    method: 'POST',
    body: params,
  });
}

// 获取用户订单列表
export async function getOrderList(params) {
  return request(`/user/orderList?${stringify(params)}`);
}

// 获取用户售后列表
export async function getOrderServiceList(params) {
  return request(`/user/orderRefund?${stringify(params)}`);
}

//用户地址列表
export async function getAddressList(params) {
  return request(`/user/address/list?${stringify(params)}`);
}

//用户地址添加
export async function memberAddressAdd(params) {
  return request('/user/address/add', {
    method: 'POST',
    body: params,
  });
}

//用户地址详情
export async function memberAddressInfo(params) {
  return request(`/user/address/info?${stringify(params)}`);
}

//用户地址修改
export async function memberAddressUpdate(params) {
  return request('/user/address/edit', {
    method: 'POST',
    body: params,
  });
}

// 用户地址删除
export async function memberAddressDelete(params) {
  return request('/user/address/delete', {
    method: 'POST',
    body: params,
  });
}