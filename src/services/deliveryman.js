import { stringify } from 'qs';
import request from '@/utils/request';

// 获取骑手列表
export async function getDeliverymanMemberList(params) {
  return request(`/driver/list?${stringify(params)}`);
}
// 获取骑手编辑页信息
export async function getDeliverymanMemberDetails(params) {
  return request(`/driver/detail?${stringify(params)}`);
}

// 获取运单列表
export async function getDeliverymanOrderList(params) {
  return request(`/driver/getDeliverList?${stringify(params)}`);
}
// 获取运单详情信息
export async function getDeliverymanOrderDetails(params) {
  return request(`/driver/deliverInfo?${stringify(params)}`);
}

// 获取骑手反馈列表
export async function getDeliverymanFeedbackList(params) {
  return request(`/driver/getFeedbackList?${stringify(params)}`);
}
// 回复骑手反馈意见
export async function replyDriverFeedBack(params) {
  return request('/driver/replyDriverFeedBack', {
    method: 'POST',
    body: params,
  });
}

// 获取骑手评论列表
export async function getCommentList(params) {
  return request(`/driver/getCommentList?${stringify(params)}`);
}

// 获取骑手运单统计
export async function getDriverDeliverStatistics(params) {
  return request(`/driver/driverDeliverStatistics?${stringify(params)}`);
}
// 获取骑手运单统计详情
export async function getDriverDeliverStatisticsDetails(params) {
  return request(`/driver/driverDeliverStatistics?${stringify(params)}`);
}
// 获取奖励设置-列表
export async function getDriverList(params) {
  return request(`/driver/grade?${stringify(params)}`);
}
//奖励设置-修改
export async function getDriverEdit(params) {
  return request('/driver/grade/edit', {
    method: 'POST',
    body: params,
  });
}
//骑手-通过认证
export async function getDriverApprove(params) {
  return request('/driver/approve', {
    method: 'POST',
    body: params,
  });
}
//骑手-不通过认证
export async function getDriverUnapproved(params) {
  return request('/driver/unapproved', {
    method: 'POST',
    body: params,
  });
}
//骑手-删除
export async function getDriverDelete(params) {
  return request('/driver/delete', {
    method: 'POST',
    body: params,
  });
}
//添加骑手
export async function getDriverAdd(params) {
  return request('/driver/add', {
    method: 'POST',
    body: params,
  });
}
//编辑骑手
export async function getHorsemanEdit(params) {
  return request('/driver/edit', {
    method: 'POST',
    body: params,
  });
}
// 骑手-详情页信息
export async function getDriverDetail(params) {
  return request(`/driver/info?${stringify(params)}`);
}
//获取骑手运单列表
export async function getDriverWaybillList(params) {
  return request(`/deliver/deliverList?${stringify(params)}`);
}

//获取评价列表（平台，全城送）
export async function getDriverCommentList(params) {
  return request(`/driver/comment?${stringify(params)}`);
}

//获取评价列表（商家自配送）
export async function getMerchantCommentList(params) {
  return request(`/driver/merchantComment?${stringify(params)}`);
}

//获取评价设置-列表
export async function getEvaluateLabelList(params) {
  return request(`/driver/evaluateLabel?${stringify(params)}`);
}
//获取评价设置-信息
export async function getEvaluateLabelInfo(params) {
  return request(`/driver/evaluateLabel/info?${stringify(params)}`);
}
//获取评价设置-添加
export async function getEvaluateLabelAdd(params) {
  return request('/driver/evaluateLabel/add', {
    method: 'POST',
    body: params,
  });
}
//获取评价设置-编辑
export async function getEvaluateLabelEdit(params) {
  return request('/driver/evaluateLabel/edit', {
    method: 'POST',
    body: params,
  });
}
//获取评价设置-删除
export async function getEvaluateLabelDelete(params) {
  return request('/driver/evaluateLabel/delete', {
    method: 'POST',
    body: params,
  });
}

