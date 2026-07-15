import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'

export default function MovieRow({ title, items, ranked = false }) {
    const navigate = useNavigate()
    const scrollerRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    if (!items || items.length === 0) return null

    const updateArrows = () => {
        const el = scrollerRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 5)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
    }

    const scrollByDirection = (direction) => {
        const el = scrollerRef.current
        if (!el) return
        el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
    }

    return (
        <section className="mb-10">
            <h2 className="text-xl text-white font-bold mb-4">{title}</h2>
            <div className="relative group/row">
                <div
                    ref={scrollerRef}
                    onScroll={updateArrows}
                    className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {items.map((item, index) => (
                        <div key={`${item.media_type}-${item.id}`} className="flex items-center shrink-0">
                            {ranked && (
                                <span className="text-5xl font-extrabold text-green-500 w-10 text-center shrink-0 select-none">
                                    {index + 1}
                                </span>
                            )}
                            <div className="w-40">
                                <MovieCard
                                    movie={item}
                                    onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {canScrollLeft && (
                    <button
                        onClick={() => scrollByDirection(-1)}
                        className="absolute inset-y-0 left-0 z-20 w-12 flex items-center justify-start bg-gradient-to-r from-black/90 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-opacity outline-none focus:outline-none"
                        title="Ver anteriores"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                )}

                {canScrollRight && (
                    <button
                        onClick={() => scrollByDirection(1)}
                        className="absolute inset-y-0 right-0 z-20 w-12 flex items-center justify-end bg-gradient-to-l from-black/90 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-opacity outline-none focus:outline-none"
                        title="Ver más"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                )}
            </div>
        </section>
    )
}
