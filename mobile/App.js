/**
 * 应用入口文件
 */
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {View, Text, StyleSheet} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>应用出错</Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString() || '未知错误'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  console.log('App component rendering...');
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigator />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;

