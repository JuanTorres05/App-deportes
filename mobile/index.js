import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      width: 100%;
      height: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      background-color: #F3F4F6;
    }
    #root > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `;
  document.head.appendChild(style);
}

registerRootComponent(App);
