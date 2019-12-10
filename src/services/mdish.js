import { stringify } from 'qs';
import request from '@/utils/request';

// 商品管理-列表
export async function getMerchantMdishList(params) {
    return request(`/merchant/mdish/list?${stringify(params)}`);
}

// 商品管理-添加-修改
export async function saveMerchantMdish(params) {
    return request('/merchant/mdish/add', {
        method: 'POST',
        body: params,
    });
}
export async function editMerchantMdish(params) {
    return request('/merchant/mdish/edit', {
        method: 'POST',
        body: params,
    });
}

// 商品管理-信息
export async function getMerchantMdishDetails(params) {
    return request(`/merchant/mdish/info?${stringify(params)}`);
}

// 商品管理-删除
export async function deleteMerchantMdish(params) {
    return request('/merchant/mdish/delete', {
        method: 'POST',
        body: params,
    });
}

// 商品管理 - 快捷上下架
export async function changeStatus(params) {
    return request('/merchant/mdish/changeStatus', {
        method: 'POST',
        body: params,
    });
}

// 商品分类-列表
export async function getMcategoryList(params) {
    return request(`/merchant/mcategory/list?${stringify(params)}`);
}

// 商品分类-添加-修改
export async function saveMcategory(params) {
    return request('/merchant/mcategory/add', {
        method: 'POST',
        body: params,
    });
}
export async function editMcategory(params) {
    return request('/merchant/mcategory/edit', {
        method: 'POST',
        body: params,
    });
}

// 商品分类-信息
export async function getMcategoryInfo(params) {
    return request(`/merchant/mcategory/info?${stringify(params)}`);
}

// 商品分类-删除
export async function deleteMcategory(params) {
    return request('/merchant/mcategory/delete', {
        method: 'POST',
        body: params,
    });
}

// 店铺门面/环境 - 保存
export async function submitMbientSave(params) {
    return request('/merchant/muser/ambientSave', {
        method: 'POST',
        body: params,
    });
}
//店铺门面 / 环境 - 信息
export async function getMbientInfo(params) {
    return request(`/merchant/muser/ambientInfo?${stringify(params)}`);
}


// 商家标签-列表
export async function getDishTagList(params) {
    return request(`/merchant/dishTag/list?${stringify(params)}`);
}

// 商家标签-添加-修改
export async function saveDishTag(params) {
    return request('/merchant/dishTag/add', {
        method: 'POST',
        body: params,
    });
}
export async function editDishTag(params) {
    return request('/merchant/dishTag/edit', {
        method: 'POST',
        body: params,
    });
}

// 商家标签-信息
export async function getDishTagInfo(params) {
    return request(`/merchant/dishTag/info?${stringify(params)}`);
}

// 商家标签-删除
export async function deleteDishTag(params) {
    return request('/merchant/dishTag/delete', {
        method: 'POST',
        body: params,
    });
}


// 商品属性模版-列表
export async function getDishAttributeList(params) {
    return request(`/merchant/dishAttribute/list?${stringify(params)}`);
}

// 商品属性模版-添加-修改
export async function saveDishAttribute(params) {
    return request('/merchant/dishAttribute/add', {
        method: 'POST',
        body: params,
    });
}
export async function editDishAttribute(params) {
    return request('/merchant/dishAttribute/edit', {
        method: 'POST',
        body: params,
    });
}

// 商品属性模版-信息
export async function getDishAttributeInfo(params) {
    return request(`/merchant/dishAttribute/info?${stringify(params)}`);
}

// 商品属性模版-删除
export async function deleteDishAttribute(params) {
    return request('/merchant/dishAttribute/delete', {
        method: 'POST',
        body: params,
    });
}


// 店铺配置 - 保存
export async function saveMuserShopInfo(params) {
    return request('/merchant/muser/shopSave', {
        method: 'POST',
        body: params,
    });
}

// 店铺配置 - 信息
export async function getMuserShopInfo(params) {
    return request(`/merchant/muser/shopInfo?${stringify(params)}`);
}

// 商家 - 资金明细列表
export async function getMerchantFinanceList(params) {
    return request(`/merchant/finance/list?${stringify(params)}`);
}

// 商家 - 订单列表
export async function getMerchantOrderList(params) {
    return request(`/merchant/order/list?${stringify(params)}`);
}

// 商家 - 评价列表
export async function getMerchantCommentList(params) {
    return request(`/merchant/comment/list?${stringify(params)}`);
}

// 商家 - 评价删除
export async function deleteMerchantComment(params) {
    return request('/merchant/comment/delete', {
        method: 'POST',
        body: params,
    });
}