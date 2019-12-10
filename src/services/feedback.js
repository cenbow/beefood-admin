import { stringify } from 'qs';
import request from '@/utils/request';

// 获取订单列表
export async function getBonusList(params) {
  return request(`/order/orderlist?${stringify(params)}`);
}

// 获取用户反馈列表
export async function getUserFeedbackList(params) {
  return request(`/feedback/user?${stringify(params)}`);
}
// 删除用户意见反馈信息
export async function deleteUserFeedback(params) {
  return request('/feedback/user/delete', {
    method: 'POST',
    body: params,
  });
}
// 回复用户反馈意见
export async function replyUserDriverFeedBack(params) {
  return request('/feedback/user/reply', {
    method: 'POST',
    body: params,
  });
}


// 获取商家反馈列表
export async function getMerchantFeedbackList(params) {
  return request(`/feedback/merchant?${stringify(params)}`);
}
// 删除商家意见反馈信息
export async function deleteMerchantFeedback(params) {
  return request('/feedback/merchant/delete', {
    method: 'POST',
    body: params,
  });
}
// 回复商家反馈意见
export async function replyMerchantDriverFeedBack(params) {
  return request('/feedback/merchant/reply', {
    method: 'POST',
    body: params,
  });
}


// 获取骑手反馈列表
export async function getDeliverymanFeedbackList(params) {
  return request(`/feedback/driver?${stringify(params)}`);
}
// 删除骑手意见反馈信息
export async function deleteDeliverymanFeedback(params) {
  return request('/feedback/driver/delete', {
    method: 'POST',
    body: params,
  });
}
// 回复骑手反馈意见
export async function replyDeliverymanDriverFeedBack(params) {
  return request('/feedback/driver/reply', {
    method: 'POST',
    body: params,
  });
}