import {
  getMerchantList,
  saveMerchant,
  editMerchant,
  getMerchantDetails,
  saveBdRelation,
  changeBdUser,
  changeMerchantBusiness,
  getAuthInfo,
  saveMerchantAuth,
  getMerchantAuditList,
  getMerchantAuditStatus,
  saveDealAudit,
  merchantChangePass,
  saveMerchantCoupon,
  getMerchantCoupon,
  saveMerchantFirstOrderReduce,
  getMerchantFirstOrderReduce,
  saveMerchantRebate,
  getMerchantRebate,
  saveMerchantFullReduction,
  getMerchantFullReduction,
} from '@/services/merchant';
import {
  getMbientInfo,
  getMuserShopInfo,
} from '@/services/mdish';

let dataList = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'merchant',

  state: {
    merchantAllList: dataList,
    merchantAuditList: dataList,
    merchantAuditStatus: {},
    authInfo: {},
    basicInfo: {},
    muserShopInfo: {},
    ambientInfo: {},
    merchantCouponInfo: {},
    merchantFirstOrderReduceInfo: {},
    merchantRebateInfo: {},
    merchantFullReductionInfo: {},
  },

  effects: {
    *fetchMerchantList({ payload }, { call, put }) {
      const response = yield call(getMerchantList, payload);
      yield put({
        type: 'merchantAllList',
        payload: response.data,
      });
    },
    *fetchSaveMerchant({ payload, callback }, { call }) {
      const response = yield call(saveMerchant, payload);
      if (callback) callback(response);
    },
    *fetchEditMerchant({ payload, callback }, { call }) {
      const response = yield call(editMerchant, payload);
      if (callback) callback(response);
    },
    *fetchChangeBdUser({ payload, callback }, { call }) {
      const response = yield call(changeBdUser, payload);
      if (callback) callback(response);
    },
    *fetchChangeMerchantBusiness({ payload, callback }, { call }) {
      const response = yield call(changeMerchantBusiness, payload);
      if (callback) callback(response);
    },

    // 商家认证信息
    *saveMerchantAuth({ payload, callback }, { call }) {
      const response = yield call(saveMerchantAuth, payload);
      if (callback) callback(response);
    },

    //认证信息
    *fetchMerchantAuthInfo({ payload, callback }, { call, put }) {
      const response = yield call(getAuthInfo, payload);
      yield put({
        type: 'merchantAuthInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    // 商家认证列表
    *fetchMerchantAuditList({ payload }, { call, put }) {
      const response = yield call(getMerchantAuditList, payload);
      yield put({
        type: 'saveMerchantAuditList',
        payload: response.data,
      });
    },

    // 商家审核状态
    *fetchMerchantAuditStatus({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantAuditStatus, payload);
      yield put({
        type: 'saveMerchantAuditStatus',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchDealAudit({ payload, callback }, { call }) {
      const response = yield call(saveDealAudit, payload);
      if (callback) callback(response);
    },

    // 基本信息
    *fetchBasicInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantDetails, payload);
      yield put({
        type: 'saveBasicInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    // 店铺配置信息
    *fetchMuserShopInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMuserShopInfo, payload);
      yield put({
        type: 'saveMuserShopInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    // 店铺环境信息
    *fetchMbientInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMbientInfo, payload);
      yield put({
        type: 'saveAmbientInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    // 修改密码
    *fetchMerchantChangePass({ payload, callback }, { call }) {
      const response = yield call(merchantChangePass, payload);
      if (callback) callback(response);
    },

    // 商家优惠活动
    *fetchSaveMerchantCoupon({ payload, callback }, { call }) {
      const response = yield call(saveMerchantCoupon, payload);
      if (callback) callback(response);
    },
    *fetchMerchantCouponInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantCoupon, payload);
      yield put({
        type: 'merchant_coupon_info',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    // 商家首单减免
    *fetchSaveMerchantFirstOrderReduce({ payload, callback }, { call }) {
      const response = yield call(saveMerchantFirstOrderReduce, payload);
      if (callback) callback(response);
    },
    *fetchMerchantFirstOrderReduceInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantFirstOrderReduce, payload);
      yield put({
        type: 'merchant_firstOrderReduce_info',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    // 商家返券
    *fetchSaveMerchantRebate({ payload, callback }, { call }) {
      const response = yield call(saveMerchantRebate, payload);
      if (callback) callback(response);
    },
    *fetchMerchantRebateInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantRebate, payload);
      yield put({
        type: 'merchant_rebate_info',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    // 商家满减
    *fetchSaveMerchantFullReduction({ payload, callback }, { call }) {
      const response = yield call(saveMerchantFullReduction, payload);
      if (callback) callback(response);
    },
    *fetchMerchantFullReductionInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantFullReduction, payload);
      yield put({
        type: 'merchant_fullReduction_info',
        payload: response.data,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    merchantAllList(state, { payload }) {
      return {
        ...state,
        merchantAllList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    merchantAuthInfo(state, { payload }) {
      return {
        ...state,
        authInfo: payload.items
      };
    },
    saveMerchantAuditList(state, { payload }) {
      return {
        ...state,
        merchantAuditList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    saveMerchantAuditStatus(state, { payload }) {
      return {
        ...state,
        merchantAuditStatus: payload.items
      };
    },
    saveBasicInfo(state, { payload }) {
      return {
        ...state,
        basicInfo: payload.items
      };
    },
    saveMuserShopInfo(state, { payload }) {
      return {
        ...state,
        muserShopInfo: payload.items
      };
    },
    saveAmbientInfo(state, { payload }) {
      return {
        ...state,
        ambientInfo: payload.items
      };
    },
    merchant_coupon_info(state, { payload }) {
      return {
        ...state,
        merchantCouponInfo: payload.items
      };
    },
    merchant_firstOrderReduce_info(state, { payload }) {
      return {
        ...state,
        merchantFirstOrderReduceInfo: payload.items
      };
    },
    merchant_rebate_info(state, { payload }) {
      return {
        ...state,
        merchantRebateInfo: payload.items
      };
    },
    merchant_fullReduction_info(state, { payload }) {
      return {
        ...state,
        merchantFullReductionInfo: payload.items
      };
    },
  },
};
