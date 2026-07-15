import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'
import pool from '../src/db/index.js'

// Hacemos un "mock" (simulación) de la base de datos y de servicios externos
// para que los tests no dependan de que haya un PostgreSQL encendido
vi.mock('../src/db/index.js', () => ({
    default: {
        query: vi.fn()
    }
}))

vi.mock('../src/services/emailService.js', () => ({
    sendVerificationEmail: vi.fn()
}))

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        // Limpiamos los mocks antes de cada test
        vi.clearAllMocks()
    })

    describe('POST /api/auth/register', () => {
        it('debe rechazar contraseñas débiles (falta mayúscula o carácter especial)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'weakpassword' // Contraseña inválida
                })
            
            // Verificamos que el servidor devuelva el código HTTP 400 (Bad Request)
            expect(res.status).toBe(400)
            // Verificamos que el mensaje de error sea el correcto
            expect(res.body.error).toContain('La contraseña debe tener al menos 8 caracteres')
            
            // Verificamos que NUNCA haya llamado a la base de datos
            expect(pool.query).not.toHaveBeenCalled()
        })
    })

    describe('POST /api/auth/login', () => {
        it('debe devolver error 401 si el usuario no existe', async () => {
            // Simulamos que la base de datos devuelve 0 resultados
            pool.query.mockResolvedValueOnce({ rows: [] })

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    identifier: 'noexiste@example.com',
                    password: 'Password123!'
                })

            // Verificamos que devuelva 401 (Unauthorized)
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Credenciales inválidas')
            
            // Verificamos que sí llamó a la BD para buscar al usuario
            expect(pool.query).toHaveBeenCalledTimes(1)
        })
    })
})
