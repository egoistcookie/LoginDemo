/**
 * React Native应用入口
 */
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('Registering app component:', appName);

AppRegistry.registerComponent(appName, () => App);

console.log('App component registered successfully');

