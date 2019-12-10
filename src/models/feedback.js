import {
  getUserFeedbackList,
  deleteUserFeedback,
  replyUserDriverFeedBack,
  getDeliverymanFeedbackList,
  deleteDeliverymanFeedback,
  replyDeliverymanDriverFeedBack,
  getMerchantFeedbackList,
  deleteMerchantFeedback,
  replyMerchantDriverFeedBack,
} from '@/services/feedback';

const listData = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'feedback',

  state: {
    userFeedbackList: listData,
    merchantFeedbackList: listData,
    deliverymanFeedbackList: listData,
  },

  effects: {
    // 用户反馈
    *fetchUserFeedbackList({ payload }, { call, put }) {
      const response = yield call(getUserFeedbackList, payload);
      yield put({
        type: 'userFeedbackList',
        payload: response.data,
      });
    },
    *removeUserFeedback({ payload, callback }, { call }) {
      const response = yield call(deleteUserFeedback, payload);
      if (callback) callback(response);
    },
    *replyUserFeedback({ payload, callback }, { call }) {
      const response = yield call(replyUserDriverFeedBack, payload);
      if (callback) callback(response);
    },
    // 商家反馈
    *fetchMerchantFeedbackList({ payload }, { call, put }) {
      const response = yield call(getMerchantFeedbackList, payload);
      yield put({
        type: 'merchantFeedbackList',
        payload: response.data,
      });
    },
    *removeMerchantFeedback({ payload, callback }, { call }) {
      const response = yield call(deleteMerchantFeedback, payload);
      if (callback) callback(response);
    },
    *replyMerchantFeedback({ payload, callback }, { call }) {
      const response = yield call(replyMerchantDriverFeedBack, payload);
      if (callback) callback(response);
    },
    // 骑手反馈
    *fetchDeliverymanFeedbackList({ payload }, { call, put }) {
      const response = yield call(getDeliverymanFeedbackList, payload);
      yield put({
        type: 'deliverymanFeedbackList',
        payload: response.data,
      });
    },
    *removeDeliverymanFeedback({ payload, callback }, { call }) {
      const response = yield call(deleteDeliverymanFeedback, payload);
      if (callback) callback(response);
    },
    *replyDeliverymanFeedback({ payload, callback }, { call }) {
      const response = yield call(replyDeliverymanDriverFeedBack, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    userFeedbackList(state, action) {
      return {
        ...state,
        userFeedbackList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
    merchantFeedbackList(state, action) {
      return {
        ...state,
        merchantFeedbackList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
    deliverymanFeedbackList(state, action) {
      return {
        ...state,
        deliverymanFeedbackList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
  },
};
