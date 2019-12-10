import { stringify } from 'qs';
import request from '@/utils/request';

// 商家消息 商家列表
export async function getMerchantList(params) {
    return request(`/message/merchant/userList?${stringify(params)}`);
}

// 商家消息推送
export async function messageMerchantSend(params) {
    return request('/message/merchant/send', {
        method: 'POST',
        body: params,
    });
}

// 商家获取历史系统消息推送
export async function messageMerchantHistory(params) {
    return request(`/message/merchant/list?${stringify(params)}`);
}

// 商家消息历史详情
export async function messageMerchantDetail(params) {
    return request(`/message/merchant/detail?${stringify(params)}`);
}

// 用户消息 用户列表
export async function getConsumerList(params) {
    return request(`/message/user/userList?${stringify(params)}`);
}

// 用户消息推送
export async function messageConsumerSend(params) {
    return request('/message/user/send', {
        method: 'POST',
        body: params,
    });
}

// 用户获取历史系统消息推送
export async function messageConsumerHistory(params) {
    return request(`/message/user/list?${stringify(params)}`);
}

// 用户消息历史详情
export async function messageConsumerDetail(params) {
    return request(`/message/user/detail?${stringify(params)}`);
}

// 骑手消息 骑手列表
export async function getDriverList(params) {
    return request(`/message/driver/userList?${stringify(params)}`);
}

// 骑手消息推送
export async function messageDriverSend(params) {
    return request('/message/driver/send', {
        method: 'POST',
        body: params,
    });
}

// 骑手获取历史系统消息推送
export async function messageDriverHistory(params) {
    return request(`/message/driver/list?${stringify(params)}`);
}

// 骑手消息历史详情
export async function messageDriverDetail(params) {
    return request(`/message/driver/detail?${stringify(params)}`);
}

// bd消息 bd列表
export async function getBdList(params) {
    return request(`/message/bd/userList?${stringify(params)}`);
}

// bd消息推送
export async function messageBdSend(params) {
    return request('/message/bd/send', {
        method: 'POST',
        body: params,
    });
}

// bd获取历史系统消息推送
export async function messageBdHistory(params) {
    return request(`/message/bd/list?${stringify(params)}`);
}

// bd消息历史详情
export async function messageBdDetail(params) {
    return request(`/message/bd/detail?${stringify(params)}`);
}
