# Claude — Project Instructions

## Язык

Всегда отвечай на русском языке.
Без лишних предисловий — сразу к делу.

---

## Стек

- Vue 3 (Composition API, `<script setup>`)
- Vue Router
- Pinia (стор)
- TypeScript (strict mode)
- CSS (без фреймворков, если не указано иное)
- Vitest (тесты)

---

## Архитектура компонентов

- Каждый компонент — не более 300 строк. Если больше — разбивай на дочерние компоненты.
- Один компонент = одна зона ответственности.
- Сложную логику (фильтрация, вычисления, side effects) выносить в composables (`/composables/use*.ts`).
- Глобальное состояние — только через Pinia сторы (`/stores/*.ts`).
- Все HTTP-запросы — только в `/api/*.ts`, нигде больше.

---

## Структура проекта

```
src/
├── api/          # Все запросы к серверу
├── components/   # Переиспользуемые компоненты
├── composables/  # use* хуки с логикой
├── stores/       # Pinia сторы
├── views/        # Страницы (роуты)
├── types/        # TypeScript типы и интерфейсы
├── router/       # Vue Router конфигурация
└── __tests__/    # Тесты (Vitest)
```

---

## Стиль кода

- Именование переменных и функций — **camelCase**
- Именование компонентов — **PascalCase**
- Именование файлов компонентов — **PascalCase.vue**
- Именование composables — **useCamelCase.ts**
- Именование сторов — **useCamelCaseStore.ts**
- TypeScript: всегда типизировать props, emits, возвращаемые значения функций
- Избегать `any` — использовать `unknown` или конкретные типы

---

## Composables

- Название всегда начинается с `use`
- Возвращают реактивные данные и функции
- Не содержат UI-логику (только данные и бизнес-логика)

```ts
// Пример структуры composable
export function useExample() {
  const state = ref(...)

  function doSomething() { ... }

  return { state, doSomething }
}
```

---

## API-слой (`/api`)

- Каждый файл отвечает за один ресурс: `userApi.ts`, `productsApi.ts`
- Типизировать запросы и ответы
- Обработка ошибок внутри api-функций

```ts
// Пример структуры api-файла
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}
```

---

## Тесты (Vitest)

- Покрывать тестами все composables и api-функции
- Тесты компонентов — для сложной UI-логики (не тривиальный рендер)
- Файл теста рядом с файлом или в `__tests__/`, название — `*.test.ts`
- Использовать `@vue/test-utils` для тестирования компонентов
- Тест должен проверять поведение, а не реализацию

```ts
// Пример структуры теста
import { describe, it, expect } from 'vitest'
import { useExample } from '@/composables/useExample'

describe('useExample', () => {
  it('should return initial state', () => {
    const { state } = useExample()
    expect(state.value).toBe(...)
  })
})
```

---

## Что НЕ делать

- Не писать запросы к серверу внутри компонентов или composables напрямую — только через `/api`
- Не хранить глобальное состояние в `provide/inject` — для этого есть Pinia
- Не использовать Options API — только Composition API
- Не оставлять `console.log` в коде

---

## Формат ответов

- Показывай только изменённый фрагмент, не весь файл (если файл большой)
- Комментарии в коде — только для неочевидных мест
- Если нужно создать несколько файлов — показывай каждый отдельно с путём в заголовке
