import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import i18n from '../i18n'

const storage: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => { storage[key] = String(value) },
  removeItem: (key: string) => { delete storage[key] },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]) },
  key: (_i: number) => null,
  get length() { return Object.keys(storage).length },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// Ensure tests run with English locale so getByText('Exercises') etc. pass
i18n.changeLanguage('en')
