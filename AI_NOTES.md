# AI_NOTES

## Что сделано
- Восстановлен ранее рабочий runtime-механизм в `gh-pages`: `index.html` снова читает `localStorage` ключи `rip.apiOrigin` и `rip.minioBase` и выставляет `window.__RUNTIME_API_ORIGIN__` и `window.__RUNTIME_MINIO_BASE__` до загрузки приложения.
- Возвращен совместимый `sw.js`, который кеширует те же asset-хэши, что и `index.html` (`index-DQcu897t.js`, `index-DOqCYXU6.css`).

## Почему
- После перехода на другой набор production-файлов пропал bootstrap-скрипт с runtime-переопределением API origin через `localStorage`, поэтому ваш прежний способ перестал работать.

## Риски/ограничения
- Если позже снова публиковать `gh-pages` из нового `dist`, нужно сохранять runtime-bootstrap в `index.html`, иначе локальный override снова пропадет.

## Как проверить (команды/шаги)
1. В консоли страницы выполнить:
   `localStorage.setItem("rip.apiOrigin","http://localhost:8080"); localStorage.setItem("rip.minioBase","http://localhost:9000/test"); location.reload();`
2. После перезагрузки проверить в DevTools Network, что запросы идут на `http://localhost:8080/api/...`.
3. Если нужно вернуть поведение по умолчанию:
   `localStorage.removeItem("rip.apiOrigin"); localStorage.removeItem("rip.minioBase"); location.reload();`
