import { stringify } from 'qs';
import request from '@/utils/request';

// 获取订单列表
export async function getOrderList(params) {
  return request(`/order/orderlist?${stringify(params)}`);
}
// 获取订单详情
export async function getOrderDetails(params) {
  return request(`/order/detail?${stringify(params)}`);
}
// 取消订单
export async function orderCancel(params) {
  return request('/order/cancel', {
    method: 'POST',
    body: params,
  });
}

// 获取订单详情操作轨迹
export async function getOrderTrace(params) {
  return request(`/order/orderTrace?${stringify(params)}`);
}

// 获取售后列表
export async function getOrderServiceList(params) {
  return request(`/order/service?${stringify(params)}`);
}
// 获取售后详情
export async function getOrderServiceDetails(params) {
  return request(`/order/orderService?${stringify(params)}`);
}

// 确认收货
export async function confirmReceipt(params) {
  return request('/order/confirmReceipt', {
    method: 'POST',
    body: params,
  });
}

// 提交售后审核结果
export async function dealOrderReturnApply(params) {
  return request('/order/dealOrderReturnApply', {
    method: 'POST',
    body: params,
  });
}
