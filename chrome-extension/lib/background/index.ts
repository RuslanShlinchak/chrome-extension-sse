import 'webextension-polyfill';
// import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { SseProxyService } from './SseProxyService';

// exampleThemeStorage.get().then(theme => {
//   console.log('theme', theme);
// });

const sseProxyService = new SseProxyService();

self.addEventListener('fetch', (e: Event) => {
  console.log('fetch', e);
  const fetchEvent = e as FetchEvent;
  return sseProxyService.register(fetchEvent);
});
