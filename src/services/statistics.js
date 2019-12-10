import { stringify } from 'qs';
import request from '@/utils/request';

// 获取销售运营数据
export async function getSalesOperation (params) {
  return request(`/statistics/salesOperation?${stringify(params)}`);
}
// 获取日期订单统计
export async function getTimeOrderStatistice (params) {
  return request(`/statistics/timeOrderStatistice?${stringify(params)}`);
}
// 获取商家订单统计
export async function getMerchantOrderStatistics (params) {
  return request(`/statistics/merchantOrderStatistics?${stringify(params)}`);
}


// 获取订单列表
export async function getBonusList (params) {
  return request(`/order/orderlist?${stringify(params)}`);
}

// 获取区域人数列表
export async function getRegionList (params) {
  return request(`/statistics/regionPeopleNum?${stringify(params)}`);
}

// 获取统计订单列表
export async function getPayOrderList (params) {
  return request(`/statistics/payOrderList?${stringify(params)}`);
}
// 获取新用户列表
export async function getNewUserList (params) {
  return request(`/statistics/newUserList?${stringify(params)}`);
}
// 获取首次下单用户列表
export async function getFirstBuyUserList (params) {
  return request(`/statistics/firstBuyUserList?${stringify(params)}`);
}

// 人数统计列表
export async function getUser (params) {
  return request(`/statistics/user?${stringify(params)}`);
}

// 代金券统计-列表
export async function getVoucherMerchant (params) {
  return request(`/statistics/voucherMerchant?${stringify(params)}`);
}

// 代金券统计-导出
export async function exportVoucherMerchant (params) {
  return request(`/statistics/voucherMerchant/export?${stringify(params)}`);
}


// 红包统计-列表
export async function getRedpacket (params) {
  return request(`/statistics/redpacket?${stringify(params)}`);
}

// 红包统计-导出
export async function exportRedpacket (params) {
  return request(`/statistics/redpacket/export?${stringify(params)}`);
}


// 商家销量统计-列表
export async function getSaleMerchant (params) {
  return request(`/statistics/saleMerchant?${stringify(params)}`);
}

// 商家销量统计-导出
export async function exportSaleMerchant (params) {
  return request(`/statistics/saleMerchant/export?${stringify(params)}`);
}

// 商品销量(商家菜品销售统计)-列表
export async function getSaleDishMerchant (params) {
  return request(`/statistics/saleDishMerchant?${stringify(params)}`);
}

// 商品销量(商家菜品销售统计)-导出
export async function exportSaleDishMerchant (params) {
  return request(`/statistics/saleDishMerchant/export?${stringify(params)}`);
}

// 商品销量详情(商家菜品销售明细统计)-列表
export async function getSaleDishDetailMerchant (params) {
  return request(`/statistics/saleDishDetailMerchant?${stringify(params)}`);
}

// 商品销量详情(商家菜品销售明细统计)-导出
export async function exportSaleDishDetailMerchant (params) {
  return request(`/statistics/saleDishDetailMerchant/export?${stringify(params)}`);
}