// Service worker mínimo — não faz cache de nada (o app é todo dinâmico/autenticado
// e cache indevido causaria dados desatualizados). Existe só pra satisfazer o
// requisito técnico do Chrome/Android de ter um SW com handler de fetch,
// o que libera o prompt de "instalar app" na tela inicial do celular.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Sem cache — deixa o navegador buscar normal na rede.
})
