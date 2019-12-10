import { getManagerBusiness, saveManagerBusiness, deleteManagerBusiness, saveBd, editBd, deleteBd, deleteBdBusiness, getBdList, getBdDetail, getBdInfo } from '@/services/bd';

const data = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'bd',

  state: {
    managerBusinessList: data,
    bdList: data,
    bdDetails: {},
  },

  effects: {
    // bd负责人商圈
    *getManagerBusiness({ payload }, { call, put }) {
      const response = yield call(getManagerBusiness, payload);
      yield put({
        type: 'savebdManagerBusinessList',
        payload: response.data,
      });
    },
    *saveManagerBusiness({ payload, callback }, { call }) {
      const response = yield call(saveManagerBusiness, payload);
      if (callback) callback(response);
    },
    *deleteManagerBusiness({ payload, callback }, { call }) {
      const response = yield call(deleteManagerBusiness, payload);
      if (callback) callback(response);
    },

    //bd管理
    *fetchBdList({ payload }, { call, put }) {
      const response = yield call(getBdList, payload);
      yield put({
        type: 'bdList',
        payload: response.data,
      });
    },
    *fetchBdInfo({ payload, callback }, { call, put }) {
      const response = yield call(getBdInfo, payload);
      if (callback) callback(response.data);
    },
    *saveBd({ payload, callback }, { call }) {
      const response = yield call(saveBd, payload);
      if (callback) callback(response);
    },
    *editBd({ payload, callback }, { call }) {
      const response = yield call(editBd, payload);
      if (callback) callback(response);
    },
    *deleteBd({ payload, callback }, { call }) {
      const response = yield call(deleteBd, payload);
      if (callback) callback(response);
    },
    *fetchBdDetails({ payload }, { call, put }) {
      const response = yield call(getBdDetail, payload);
      yield put({
        type: 'bdDetails',
        payload: response.data,
      });
    },
    *fetchDeleteBdBusiness({ payload, callback }, { call }) {
      const response = yield call(deleteBdBusiness, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    savebdManagerBusinessList(state, { payload }) {
      return {
        ...state,
        managerBusinessList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    bdList(state, { payload }) {
      return {
        ...state,
        bdList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    bdDetails(state, { payload }) {
      return {
        ...state,
        bdDetails: payload.items
      };
    },
  },
};
