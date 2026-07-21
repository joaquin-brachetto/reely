import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center justify-center"
                aria-label="Página anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-gray-300 font-medium text-sm sm:text-base">
                Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white">{totalPages}</span>
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center justify-center"
                aria-label="Página siguiente"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
