// src/boot/index.js
export { api } from "./modules/axios.js";
export { supabase } from "./modules/supabase.js";

/**
 * Cada módulo em ./modules exporta como default uma função:
 *   (app) => void | Promise<void>
 *
 * A ordem de inicialização é definida pelo array `order` passado para
 * `registerBoot`, usando o nome do arquivo (sem extensão).
 */
const modules = import.meta.glob('./modules/*.js', { eager: true })

/** Mapa { nome-do-arquivo: módulo } */
const moduleMap = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const name = path.replace(/^\.\/modules\//, '').replace(/\.js$/, '')
    return [name, mod]
  }),
)

/**
 * Registra (executa) os módulos de boot na aplicação Vue.
 * @param {import('vue').App} app
 * @param {string[]} [order] Nomes dos módulos (sem extensão) na ordem de execução.
 *   Os não listados aqui são executados depois, em ordem alfabética.
 * @returns {Promise<void>}
 */
export async function registerBoot(app, order = []) {
  const remaining = Object.keys(moduleMap).filter((name) => !order.includes(name))
  const sequence = [...order, ...remaining.sort()]

  for (const name of sequence) {
    const mod = /** @type {{ default: (app: import('vue').App) => unknown }} */ (
      moduleMap[name]
    )

    if (!mod) {
      console.warn(`[boot] módulo "${name}" não encontrado em ./modules.`)
      continue
    }

    if (typeof mod.default !== 'function') {
      console.warn(`[boot] módulo "${name}" não possui export default como função.`)
      continue
    }

    await mod.default(app)
  }
}
