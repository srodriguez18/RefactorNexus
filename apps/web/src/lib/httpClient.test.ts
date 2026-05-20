import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { httpClient } from './httpClient'

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
  vi.stubGlobal('location', { href: '' })
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function makeResponse(status: number, body?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body ?? {}),
  } as unknown as Response
}

describe('httpClient', () => {
  test('throws when fetch fails (network error)', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(httpClient('/test')).rejects.toThrow('No se pudo conectar al servidor')
  })

  test('redirects to /login and throws on 401', async () => {
    mockFetch.mockResolvedValue(makeResponse(401))
    await expect(httpClient('/test')).rejects.toThrow('Sesión expirada')
    expect(window.location.href).toBe('/login')
    expect(localStorage.getItem('token')).toBeNull()
  })

  test('throws with server error message on non-ok response', async () => {
    mockFetch.mockResolvedValue(makeResponse(400, { error: 'Datos inválidos' }))
    await expect(httpClient('/test')).rejects.toThrow('Datos inválidos')
  })

  test('throws generic error when non-ok body has no error field', async () => {
    mockFetch.mockResolvedValue(makeResponse(500, {}))
    await expect(httpClient('/test')).rejects.toThrow('Error 500')
  })

  test('returns undefined on 204 No Content', async () => {
    mockFetch.mockResolvedValue(makeResponse(204))
    const result = await httpClient('/test')
    expect(result).toBeUndefined()
  })

  test('returns parsed JSON on 200', async () => {
    const data = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValue(makeResponse(200, data))
    const result = await httpClient<typeof data>('/test')
    expect(result).toEqual(data)
  })

  test('sets Authorization header when token is in localStorage', async () => {
    localStorage.setItem('token', 'my-token')
    mockFetch.mockResolvedValue(makeResponse(200, {}))
    await httpClient('/test')
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token')
  })

  test('does not set Authorization header when no token', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, {}))
    await httpClient('/test')
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  test('sets Content-Type only when body is present', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, {}))

    await httpClient('/no-body')
    const [, optionsNoBody] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((optionsNoBody.headers as Record<string, string>)['Content-Type']).toBeUndefined()

    mockFetch.mockResolvedValue(makeResponse(200, {}))
    await httpClient('/with-body', { method: 'POST', body: JSON.stringify({ x: 1 }) })
    const [, optionsWithBody] = mockFetch.mock.calls[1] as [string, RequestInit]
    expect((optionsWithBody.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  test('prefixes path with /api', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, {}))
    await httpClient('/catalog')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/catalog')
  })
})
