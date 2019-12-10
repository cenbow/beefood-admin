import {
  getSubjectList,
  addSubject,
  editSubject,
  getSubjectInfo,
  deleteSubject,
  enableSubject,
  disableSubject
} from '@/services/config';

export default {
  namespace: 'activity',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchSubjectList ({ payload }, { call, put }) {
      const response = yield call(getSubjectList, payload);
      yield put({
        type: 'subjectList',
        payload: response.data,
      });
    },
    *fetchSubjectInfo ({ payload, callback }, { call }) {
      const response = yield call(getSubjectInfo, payload);
      if (callback) callback(response);
    },
    *fetchAddSubject ({ payload, callback }, { call }) {
      const response = yield call(addSubject, payload);
      if (callback) callback(response);
    },
    *fetchEditSubject ({ payload, callback }, { call }) {
      const response = yield call(editSubject, payload);
      if (callback) callback(response);
    },
    *fetchDeleteSubject ({ payload, callback }, { call }) {
      const response = yield call(deleteSubject, payload);
      if (callback) callback(response);
    },
    *fetchEnableSubject ({ payload, callback }, { call }) {
      const response = yield call(enableSubject, payload);
      if (callback) callback(response);
    },
    *fetchDisableSubject ({ payload, callback }, { call }) {
      const response = yield call(disableSubject, payload);
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
