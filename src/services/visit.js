import { stringify } from 'qs';
import request from '@/utils/request';

//拜访管理-列表
export async function queryAdminVisit (params) {
    return request(`/visit?${stringify(params)}`);
}
//拜访管理-添加/修改
export async function queryAdminVisitSave (params) {
    return request('/visit/edit', {
        method: 'POST',
        body: params,
    });
}
//拜访管理 - 拜访路径(完成)
export async function queryAdminPath (params) {
    return request(`/visit/path?${stringify(params)}`);
}

// 拜访管理-删除(完成)
export async function deleteVisit (params) {
    return request('/visit/delete', {
        method: 'POST',
        body: params,
    });
}

// 拜访管理详情
export async function getVisitDetail (params) {
    return request(`/visit/info?${stringify(params)}`);
}