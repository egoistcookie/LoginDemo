/**
 * React Native应用入口文件
 * 
 * 这个文件是整个React Native应用的启动入口点。
 * 它的主要作用是：
 * 1. 导入React Native的核心注册模块 AppRegistry
 * 2. 导入应用的根组件 App
 * 3. 从app.json中读取应用名称
 * 4. 将根组件注册到React Native框架中
 * 
 * 当应用启动时，React Native会调用这里注册的组件来渲染应用界面。
 */

// 导入React Native的AppRegistry模块
// AppRegistry是React Native的核心模块，用于注册和启动应用组件
import {AppRegistry} from 'react-native';

// 导入应用的根组件
// App组件是整个应用的顶层组件，包含了应用的导航和主要逻辑
import App from './App';

// 从app.json配置文件中读取应用名称
// app.json是React Native应用的配置文件，包含应用的基本信息
import {name as appName} from './app.json';

// 打印日志：正在注册应用组件
console.log('Registering app component:', appName);

/**
 * 注册应用组件
 * 
 * AppRegistry.registerComponent 是React Native提供的全局方法，
 * 用于将React组件注册为应用的根组件。
 * 
 * 参数说明：
 * - appName: 应用名称，必须与app.json中的name字段一致
 * - () => App: 返回根组件的函数，React Native会调用这个函数来获取根组件
 * 
 * 注册后，React Native会根据这个名称来启动和渲染应用。
 */
AppRegistry.registerComponent(appName, () => App);

// 打印日志：应用组件注册成功
console.log('App component registered successfully');

