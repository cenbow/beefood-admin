import { stringify } from 'qs';
import request from '@/utils/request';

// 获取商品列表
export async function getProductList(params) {
    return request(`/product/getList?${stringify(params)}`);
}


// 获取商品评论列表
export async function getProductCommentList(params) {
    return request(`/product/commentList?${stringify(params)}`);
}