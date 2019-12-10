import { stringify } from 'qs';
import { getPage, getPageEdit, getPromotionList, redpacketSend, redpacketDelete, getRedpacketDetail, getRedpacketUserList, getRegionList, getRegionDetail } from '@/services/config';
import { queryMemberConsumer } from '@/services/member';
import { message } from 'antd';

const listData = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'config',

  state: {
    notice: [],
    getPage: {},
    data: listData,
    promotionList: listData,
    promotionDetails: {},
    redpacketUserList: listData,
    regionList: listData,
    regionDetail: {},
  },

  effects: {
    *fetchPage({ payload, callback }, { call, put }) {
      const response = yield call(getPage, payload);
      yield put({
        type: 'getPage',
        payload: response.data,
      });
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
    *fetchPageEdit({ payload, callback }, { call }) {
      const response = yield call(getPageEdit, payload);
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
    *fetchUserList({ payload }, { call, put }) {
      const response = yield call(queryMemberConsumer, payload);
      yield put({
        type: 'saveUserList',
        payload: response.data,
      });
    },
    *fetchPromotionList({ payload }, { call, put }) {
      const response = yield call(getPromotionList, payload);
      yield put({
        type: 'savePromotionList',
        payload: response.data,
      });
    },
    *redpacketSend({ payload, callback }, { call }) {
      const response = yield call(redpacketSend, payload);
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
    *redpacketDelete({ payload, callback }, { call }) {
      const response = yield call(redpacketDelete, payload);
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
    *fetchPromotionDetails({ payload }, { call, put }) {
      const response = yield call(getRedpacketDetail, payload);
      yield put({
        type: 'savePromotionDetails',
        payload: response.data,
      });
    },
    *fetchRedpacketUserList({ payload }, { call, put }) {
      const response = yield call(getRedpacketUserList, payload);
      yield put({
        type: 'redpacketUserList',
        payload: response.data,
      });
    },
    *fetchRegionList({ payload }, { call, put }) {
      const response = yield call(getRegionList, payload);
      yield put({
        type: 'regionList',
        payload: response.data,
      });
    },
    *fetchRegionDetail({ payload }, { call, put }) {
      const response = yield call(getRegionDetail, payload);
      yield put({
        type: 'regionDetail',
        payload: response.data,
      });
    },
  },

  reducers: {
    getPage(state, { payload }) {
      return {
        ...state,
        getPage: payload.items,
      };
    },
    saveUserList(state, { payload }) {
      return {
        ...state,
        data: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    savePromotionList(state, { payload }) {
      return {
        ...state,
        promotionList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    savePromotionDetails(state, { payload }) {
      return {
        ...state,
        promotionDetails: payload.items,
      }
    },
    redpacketUserList(state, { payload }) {
      return {
        ...state,
        redpacketUserList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    regionList(state, { payload }) {
      return {
        ...state,
        regionList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    regionDetail(state, { payload }) {
      return {
        ...state,
        regionDetail: payload.items,
      }
    },
  },
};
