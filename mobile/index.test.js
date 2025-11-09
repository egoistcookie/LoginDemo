/**
 * React Native应用入口 - 最小测试版本
 */
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

console.log('=== Starting App Registration ===');
console.log('App name:', appName);

// 创建一个最简单的测试组件
const TestApp = () => {
  console.log('TestApp rendering...');
  const {View, Text} = require('react-native');
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
      <Text style={{fontSize: 20}}>Hello React Native!</Text>
    </View>
  );
};

console.log('Registering component:', appName);
try {
  AppRegistry.registerComponent(appName, () => TestApp);
  console.log('Component registered successfully!');
} catch (error) {
  console.error('Registration error:', error);
}

