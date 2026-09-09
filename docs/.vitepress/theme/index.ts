import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import FloatingBuyCoffee from './FloatingBuyCoffee.vue';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(FloatingBuyCoffee),
    });
  },
};
