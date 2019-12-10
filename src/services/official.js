import { stringify } from 'qs';
import request from '@/utils/request';

// 获取公司简介
export async function getCompanyIntroduction(params) {
  return request(`/business/country?${stringify(params)}`);
}
// 国家详情页信息

// 删除国家
export async function deleteCountry(params) {
  return request('/business/country/delete', {
    method: 'POST',
    body: params,
  });
}

