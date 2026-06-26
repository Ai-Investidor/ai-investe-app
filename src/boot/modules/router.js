// src/boot/modules/router.js
import router from '@/router'

/**
 * @param {import('vue').App} app
 */
export default function bootRouter(app) {
  app.use(router)
}
