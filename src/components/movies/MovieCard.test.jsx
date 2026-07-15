import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MovieCard from './MovieCard'

// Simulamos (mock) el hook useWatchlist porque MovieCard lo usa
// y no queremos tener que envolver el test en todo un <WatchlistProvider>
vi.mock('../../context/WatchlistContext', () => ({
    useWatchlist: () => ({
        isSaved: vi.fn().mockReturnValue(false),
        toggle: vi.fn()
    })
}))

describe('MovieCard Component', () => {
    it('debe renderizar la imagen con el título correcto como texto alternativo', () => {
        const mockMovie = {
            id: 1,
            title: 'Matrix',
            poster_path: '/matrix.jpg',
            media_type: 'movie'
        }

        render(<MovieCard movie={mockMovie} onClick={() => {}} />)

        // Buscamos la imagen y verificamos que el atributo 'alt' sea 'Matrix'
        const image = screen.getByRole('img')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('alt', 'Matrix')
    })
    
    it('debe mostrar la etiqueta "Próximamente" si la película aún no se estrenó', () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)
        
        const mockMovie = {
            id: 2,
            title: 'Película del Futuro',
            release_date: futureDate.toISOString().split('T')[0],
            media_type: 'movie'
        }

        render(<MovieCard movie={mockMovie} onClick={() => {}} />)

        // Verificamos que aparezca el span indicando que es Próximamente
        const upcomingBadge = screen.getByText('Próximamente')
        expect(upcomingBadge).toBeInTheDocument()
    })
})
