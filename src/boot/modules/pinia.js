// src/boot/modules/pinia.js
import { createPinia } from 'pinia'

/**
 * @param {import('vue').App} app
 */
export default function bootPinia(app) {
  app.use(createPinia())
}
