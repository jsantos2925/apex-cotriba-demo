self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});
self.addEventListener('fetch', (e) => {
  // Apenas permite o app rodar, lógica offline complexa fica para fase 2
});
