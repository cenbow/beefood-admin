import { queryFakeList, removeFakeList, addFakeList, updateFakeList } from '@/services/api';
import {
  getDeliverymanMemberDetails,
  getDeliverymanOrderDetails,
  getDriverWaybillList,
} from '@/services/deliveryman';

export default {
  namespace: 'list',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    list: [],
    details: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'queryList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *appendFetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'appendList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *submit({ payload }, { call, put }) {
      let callback;
      if (payload.id) {
        callback = Object.keys(payload).length === 1 ? removeFakeList : updateFakeList;
      } else {
        callback = addFakeList;
      }
      const response = yield call(callback, payload); // post
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    // 获取骑手详情信息
    *fetchDeliverymanMemberDetails({ payload, callback }, { call, put }) {
      const response = yield call(getDeliverymanMemberDetails, payload);
      yield put({
        type: 'getDetails',
        payload: response.data.items,
      });
      if (callback) callback(response);
    },
    // 获取运单详情
    *fetchDeliverymanOrderDetails({ payload }, { call, put }) {
      const response = yield call(getDeliverymanOrderDetails, payload);
      yield put({
        type: 'getDetails',
        payload: response.data.items,
      });
    },
    //获取骑手运单列表
    *fetchDriverWaybillList({ payload }, { call, put }) {
      const response = yield call(getDriverWaybillList, payload);
      yield put({
        type: 'waybillList',
        payload: response.data,
      });
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    appendList(state, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
    waybillList(state, action) {
      return {
        ...state,
        // data: action.payload,
        data: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    getDetails(state, action) {
      return {
        ...state,
        details: action.payload,
      };
    },
  },
};
