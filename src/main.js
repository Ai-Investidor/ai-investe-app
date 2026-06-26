import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import { registerBoot } from '@boot'

async function bootstrap() {
  const app = createApp(App)

  await registerBoot(app, ['pinia', 'router'])

  app.mount('#app')
}

bootstrap()
