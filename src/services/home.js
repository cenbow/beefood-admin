import { stringify } from 'qs';
import request from '@/utils/request';

// 获取统计数据
export async function getHomeInfo(params) {
  return request(`/statistics/homePage?${stringify(params)}`);
}

// 订单配送异常
export async function getOrderFailList(params) {
  return request(`/refund/userOrder?${stringify(params)}`);
}

// 用户取消订单，用户订单退款
export async function getOrderRefundList(params) {
  return request(`/refund/userOrder?${stringify(params)}`);
}

// 商户认证申请
export async function getMerchantAuditList(params) {
  return request(`/merchant/audit/list?${stringify(params)}`);
}

// 商家意见反馈
export async function getFeedbackMerchantList(params) {
  return request(`/feedback/merchant?${stringify(params)}`);
}

// 用户意见反馈
export async function getFeedbackUserList(params) {
  return request(`/feedback/user?${stringify(params)}`);
}

// 骑手意见反馈
export async function getFeedbackDriverList(params) {
  return request(`/feedback/driver?${stringify(params)}`);
}