import { 
  getClassifyList,
  addClassify,
  editClassify,
  getClassifyInfo,
  deleteClassify,
} from '@/services/config';

const data = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'configBase',

  state: {
    classifyList: data,
  },

  effects: {
    *fetchClassifyList({ payload }, { call, put }) {
      const response = yield call(getClassifyList, payload);
      yield put({
        type: 'configClassifyList',
        payload: response.data,
      });
    },
    *fetchClassifyInfo({ payload }, { call }) {
      const response = yield call(getClassifyInfo, payload);
      if (callback) callback(response);
    },
    *addClassify({ payload, callback }, { call }) {
      const response = yield call(addClassify, payload);
      if (callback) callback(response);
    },
    *editClassify({ payload, callback }, { call }) {
      const response = yield call(editClassify, payload);
      if (callback) callback(response);
    }, 
    *deleteClassify({ payload, callback }, { call }) {
      const response = yield call(deleteClassify, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    configClassifyList(state, { payload }) {
      return {
        ...state,
        classifyList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
  },
};
