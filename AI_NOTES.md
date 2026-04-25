# AI_NOTES

## Что сделано
- Подключен новый бандл в `gh-pages` (`assets/index-Dj8WdEig.js` и актуальный `sw.js`) вместо старого `index-DQcu897t.js`.
- Прогнан postbuild-патч для runtime API origin: новый `assets/index-Dj8WdEig.js` читает `window.__RUNTIME_API_ORIGIN__`.
- Добавлен `runtime-config.json` и сохранен override через `localStorage`: в `index.html` сначала берется `localStorage["rip.apiOrigin"]`, и только если ключ пустой — fallback к `runtime-config.json`.
- Исправлен белый экран из-за путей: в `index.html` ссылки на `vite.svg`, `manifest.webmanifest`, JS/CSS бандл переведены на относительные (`vite.svg`, `assets/...`) вместо жестко зашитого `/org-structure-frontend/...`.

## Почему
- Нужно было одновременно: отдать свежий фронтенд из `lab8-tauri-pwa` и не потерять ваш привычный runtime override API через консоль.
- Абсолютный префикс `/org-structure-frontend/` ломает загрузку на другом URL деплоя; относительные пути работают и на корне домена, и в подпапке.

## Риски/ограничения
- После публикации браузер может держать старый service worker; нужен hard refresh или очистка site data.
- Если CI снова перезапишет `index.html` с абсолютным base, проблему белого экрана нужно будет фиксить в пайплайне генерации.

## Как проверить (команды/шаги)
1. В консоли страницы выполнить:
   `localStorage.setItem("rip.apiOrigin","http://localhost:8080"); location.reload();`
2. После перезагрузки проверить в DevTools Network, что загрузился `assets/index-Dj8WdEig.js` и запросы API используют runtime origin.
3. Если нужно вернуть поведение по умолчанию:
   `localStorage.removeItem("rip.apiOrigin"); location.reload();`
4. Если белый экран остается: DevTools → Application → Service Workers → Unregister + Clear storage, затем `Ctrl+F5`.
