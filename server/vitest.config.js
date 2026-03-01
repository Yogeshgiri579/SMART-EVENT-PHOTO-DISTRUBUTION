import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable Jest-compatible global APIs (describe, it, expect, beforeAll, afterAll)
    // so the existing test file works without any imports
    globals: true,
    environment: 'node',
  },
})
