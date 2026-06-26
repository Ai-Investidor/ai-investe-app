// src/boot/index.js

/**
 * Cada módulo em ./modules exporta como default uma função:
 *   (app) => void | Promise<void>
 *
 * Os módulos são carregados e executados em ordem alfabética do caminho,
 * então use prefixos numéricos (ex.: 01-pinia.js, 02-router.js) para
 * controlar a ordem de inicialização.
 */
const modules = import.meta.glob('./modules/*.js', { eager: true })

/**
 * Registra (executa) todos os módulos de boot na aplicação Vue.
 * @param {import('vue').App} app
 * @returns {Promise<void>}
 */
export async function registerBoot(app) {
  for (const path of Object.keys(modules).sort()) {
    const mod = /** @type {{ default: (app: import('vue').App) => unknown }} */ (
      modules[path]
    )

    if (typeof mod.default !== 'function') {
      console.warn(`[boot] módulo "${path}" não possui export default como função.`)
      continue
    }

    await mod.default(app)
  }
}
