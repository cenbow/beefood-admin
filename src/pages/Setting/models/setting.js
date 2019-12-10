import {
  getRoleList,
  getManagerList,
  managerSend,
  getManagerDetail,
  roleCreate,
  roleEdit,
  getRoleDetail,
  getPermissionList,
  getPermissionDelete,
  getPermissionCreate,
  getPermissionEdit,
  getRoleDelete,
  getRolePermissions,
  getRoleAuthorise,
  getManagerDelete,
  managerEdit,
  getManagerInfo,
  getManagerStatus,
} from '@/services/setting';

const listData = {
  list: [],
  pagination: {},
};

export default {
  namespace: 'adminSetting',

  state: {
    roleList: listData,
    managerList: listData,
    permission: [],
    managerDetail: {
      username: '',
      realname: '',
      group_id: '',
    },
    managerInfo: {},
    roleDetail: {
      title: '',
      rules: '',
      status: '',
      create_time: '',
    },
  },

  effects: {
    *fetchManagerList({ payload }, { call, put }) {
      const response = yield call(getManagerList, payload);
      yield put({
        type: 'managerList',
        payload: response.data,
      });
    },
    //后台管理员添加
    *fetchManagerSend({ payload, callback }, { call }) {
      const response = yield call(managerSend, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //后台管理员编辑
    *fetchManagerEdit({ payload, callback }, { call }) {
      const response = yield call(managerEdit, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //改变管理员状态
    *fetchManagerStatus({ payload, callback }, { call }) {
      const response = yield call(getManagerStatus, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //获取管理员信息
    *fetchManagerInfo({ payload, callback }, { call, put }) {
      const response = yield call(getManagerInfo, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
      yield put({
        type: 'ManagerInfo',
        payload: response.data,
      });
    },
    *fetchManagerDetail({ payload }, { call, put }) {
      const response = yield call(getManagerDetail, payload);
      yield put({
        type: 'managerDetail',
        payload: response.data,
      });
    },
    //删除后台管理员
    *fetchManagerDelete({ payload, callback }, { call }) {
      const response = yield call(getManagerDelete, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },

    *fetchRoleList({ payload }, { call, put }) {
      const response = yield call(getRoleList, payload);
      yield put({
        type: 'roleList',
        payload: response.data,
      });
    },
    //添加角色信息
    *fetchRoleCreate({ payload, callback }, { call }) {
      const response = yield call(roleCreate, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //修改角色信息
    *fetchRoleEdit({ payload, callback }, { call }) {
      const response = yield call(roleEdit, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //角色详情
    *fetchRoleDetail({ payload }, { call, put }) {
      const response = yield call(getRoleDetail, payload);
      yield put({
        type: 'roleDetail',
        payload: response.data,
      });
    },
    //删除角色
    *fetchRoleDelete({ payload, callback }, { call }) {
      const response = yield call(getRoleDelete, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //角色权限列表
    *fetchRolePermissions({ payload, callback }, { call, put }) {
      const response = yield call(getRolePermissions, payload);
      yield put({
        type: 'permissionList',
        payload: response.data,
      });
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //角色权限授权
    *fetchRoleAuthorise({ payload, callback }, { call }) {
      const response = yield call(getRoleAuthorise, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //权限列表
    *fetchPermissionList(_, { call, put }) {
      const response = yield call(getPermissionList);
      yield put({
        type: 'permissionList',
        payload: response.data,
      });
    },
    //删除权限
    *fetchPermissionDelete({ payload, callback }, { call }) {
      const response = yield call(getPermissionDelete, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
    },
    //创建权限
    *fetchPermissionCreate({ payload, callback }, { call }) {
      const response = yield call(getPermissionCreate, payload);
      if (callback) callback(response);
    },
    //修改权限
    *fetchPermissionEdit({ payload, callback }, { call }) {
      const response = yield call(getPermissionEdit, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    managerList(state, { payload }) {
      console.log(payload);
      return {
        ...state,
        managerList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    managerDetail(state, { payload }) {
      return {
        ...state,
        managerDetail: payload.items,
      };
    },
    ManagerInfo(state, { payload }) {
      return {
        ...state,
        managerInfo: payload.items,
      };
    },
    roleList(state, { payload }) {
      return {
        ...state,
        roleList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    roleDetail(state, { payload }) {
      return {
        ...state,
        roleDetail: payload.items,
      };
    },
    permissionList(state, { payload }) {
      return {
        ...state,
        permission: payload.items,
      };
    },
  },
};
