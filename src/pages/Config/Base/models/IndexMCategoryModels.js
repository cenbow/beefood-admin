import {
  getIndexMCategoryList,
  addIndexMCategory,
  deleteIndexMCategory,
} from '@/services/config';

export default {
  namespace: 'indexMCategory',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchIndexMCategoryList ({ payload }, { call, put }) {
      const response = yield call(getIndexMCategoryList, payload);
      yield put({
        type: 'subjectList',
        payload: response.data,
      });
    },
    *fetchAddIndexMCategory ({ payload, callback }, { call }) {
      const response = yield call(addIndexMCategory, payload);
      if (callback) callback(response);
    },
    *fetchDeleteIndexMCategory ({ payload, callback }, { call }) {
      const response = yield call(deleteIndexMCategory, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    subjectList (state, action) {
      return {
        ...state,
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
  },
};
