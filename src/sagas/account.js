import { fork, take, put, call } from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { md5Passwd } from '../services/utility';
import { types as accountTypes } from '../reducers/account';
import { actions as accountActions } from '../reducers/account';
import { types as commonTypes } from '../reducers/common';
import axios from 'axios';
import history from '../history';

/**
 * 处理用户注册页面的submit异步请求
 */
function* regFlow() {
  while (true) {
    const { resolve, values } = yield take(accountTypes.SAGA_REG_REQUEST);
    yield put({ type: commonTypes.START_LOADING });
    let { username, password1: password } = values;
    password = md5Passwd(password);
    const response = yield axios.post('account/reg', { username, password });
    if (response.success) {
      yield call(resolve);
      yield call(history.push, '/login');
    } else {
      yield put(stopSubmit('regForm', { _error: response.error }));
    }
    yield put({ type: commonTypes.STOP_LOADING });
  }
}

function* loginFlow() {
  let isLogin = !!localStorage.getItem('token');
  while (true) {
    // todo 修改登录流程，改为cookies方式
    console.log('login flow start');
    if (!isLogin) {
      // 如果页面是未登录状态
      let { resolve, values, from } = yield take(
        accountTypes.SAGA_LOGIN_REQUEST
      );
      const username = values.username.toLowerCase();
      const password = md5Passwd(values.password);
      const remember = values.remember || false;
      const response = yield axios.post('account/login', {
        username,
        password,
        remember
      });
      if (response.success) {
        yield call(resolve);
        yield put(accountActions.loginSuccess(username, response.data.active));
        isLogin = true;
        yield call(history.push, from.pathname); // 根据url的redirect进行跳转
      } else {
        isLogin = false;
        yield put(stopSubmit('loginForm', { _error: response.error }));
      }
    }
    if (isLogin) {
      console.log('等待logout请求');
      // 这里应同时接收强制退出action，在启用应用验证用户出错，或者token失效等场合
      const { type } = yield take([
        accountTypes.SAGA_LOGOUT_REQUEST,
        accountTypes.SAGA_FORCE_LOGOUT
      ]);
      console.log(`接收到logout请求${type}`);
      // yield put({ type: accountTypes.LOGOUT_SUCCESS });
      yield put(accountActions.logoutSuccess());
      isLogin = false;
    }
  }
}

/**
 * 处理用户注册页面username焦点消失时的唯一性验证
 */
function* checkUsernameFlow() {
  while (true) {
    const { values, resolve, reject } = yield take(
      accountTypes.SAGA_CHECK_USERNAME
    );
    const response = yield axios.get(`account/check/${values.username}`);
    if (response.success) {
      if (response.data.isNameExist) {
        yield call(reject, { username: `用户名${values.username}已存在` });
      } else {
        yield call(resolve);
      }
    } else {
      yield call(reject, { username: ' ' }); // 空格用于保持textField的error提示行高度
    }
  }
}

/**
 * 在初始打开网页的时候到服务器获取用户认证相关信息
 */
function* getUserInfoFlow() {
  while (true) {
    yield take(accountTypes.SAGA_GET_USER_AUTH_INFO);
    // url中有username，header中有auth token，服务端综合判定
    const response = yield axios.get('/account/auth');
    console.log(response);
    console.log('测试 强制判断localstorage token信息和远端不一致');
    // yield put({ type: accountTypes.SAGA_FORCE_LOGOUT });
    // yield put(commonActions.showMessage('远程验证出错，强制退出', 'warn'));
  }
}

function* getBasicInfoFlow() {
  while (true) {
    yield take(accountTypes.SAGA_GET_USER_BASIC_INFO);
    const response = yield axios.get('/account/info/basic');
    if (response.success) {
      yield put(accountActions.setBasicInfo(response.data));
    }
  }
}

export default [
  fork(checkUsernameFlow),
  fork(regFlow),
  fork(getUserInfoFlow),
  fork(loginFlow),
  fork(getBasicInfoFlow)
];
