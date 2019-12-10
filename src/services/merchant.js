import { stringify } from 'qs';
import request from '@/utils/request';

// 商家管理-商家列表
export async function getMerchantList(params) {
  return request(`/merchant/muser/list?${stringify(params)}`);
}

// 商家管理-新增-修改
export async function saveMerchant(params) {
  return request('/merchant/muser/add', {
    method: 'POST',
    body: params,
  });
}
export async function editMerchant(params) {
  return request('/merchant/muser/basicSave', {
    method: 'POST',
    body: params,
  });
}

// 商家基本信息-详情
export async function getMerchantDetails(params) {
  return request(`/merchant/muser/basicInfo?${stringify(params)}`);
}

// 商家管理-关注-认领
export async function saveBdRelation(params) {
  return request('/merchant/muser/bdRelation', {
    method: 'POST',
    body: params,
  });
}

// 商家审核 - 提交认证
export async function submitMerahantAuth(params) {
  return request('/merchant/audit/submitAudit', {
    method: 'POST',
    body: params,
  });
}

// 商家管理-批量分配责任人
export async function changeBdUser(params) {
  return request('/merchant/muser/changeBdUser', {
    method: 'POST',
    body: params,
  });
}

// 商家管理-修改商家营业状态
export async function changeMerchantBusiness(params) {
  return request('/merchant/muser/changeBusiness', {
    method: 'POST',
    body: params,
  });
}

// 商家认证 -信息
export async function getAuthInfo(params) {
  return request(`/merchant/muser/authInfo?${stringify(params)}`);
}

// 商家认证 -保存
export async function saveMerchantAuth(params) {
  return request('/merchant/muser/authSave', {
    method: 'POST',
    body: params,
  });
}

// 商家审核-列表
export async function getMerchantAuditList(params) {
  return request(`/merchant/audit/list?${stringify(params)}`);
}

// 获取商家认证信息
export async function getMerchantAuditStatus(params) {
  return request(`/merchant/audit/merchantAudit?${stringify(params)}`);
}

// 商家审核-提交审核结果
export async function saveDealAudit(params) {
  return request('/merchant/audit/dealAudit', {
    method: 'POST',
    body: params,
  });
}

// 商家管理-修改密码
export async function merchantChangePass(params) {
  return request('/merchant/muser/changePass', {
    method: 'POST',
    body: params,
  });
}


// 优惠券 - 添加、修改规则
export async function saveMerchantCoupon(params) {
  return request('/merchant/coupon/save', {
    method: 'POST',
    body: params,
  });
}
// 优惠券 - 获取优惠券规则
export async function getMerchantCoupon(params) {
  return request(`/merchant/coupon/info?${stringify(params)}`);
}

// 首单减免 - 添加、修改规则
export async function saveMerchantFirstOrderReduce(params) {
  return request('/merchant/firstOrderReduce/save', {
    method: 'POST',
    body: params,
  });
}
// 首单减免 - 获取规则
export async function getMerchantFirstOrderReduce(params) {
  return request(`/merchant/firstOrderReduce/info?${stringify(params)}`);
}

// 返券 - 添加、修改返券配置
export async function saveMerchantRebate(params) {
  return request('/merchant/rebate/save', {
    method: 'POST',
    body: params,
  });
}
// 返券 - 获取返券配置
export async function getMerchantRebate(params) {
  return request(`/merchant/rebate/info?${stringify(params)}`);
}

// 满减 - 添加、修改满减配置
export async function saveMerchantFullReduction(params) {
  return request('/merchant/fullReduction/save', {
    method: 'POST',
    body: params,
  });
}
// 满减 - 获取满减配置
export async function getMerchantFullReduction(params) {
  return request(`/merchant/fullReduction/info?${stringify(params)}`);
}