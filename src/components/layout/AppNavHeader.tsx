import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import Logo from './Logo'

interface AppNavHeaderProps {
    active: 'home' | 'watchlist' | string;
    onHome?: () => void;
    children?: ReactNode;
}

export default function AppNavHeader({ active, onHome, children }: AppNavHeaderProps) {
    const navigate = useNavigate()

    const goHome = () => {
        navigate('/')
        onHome?.()
    }

    return (
        <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <nav className="flex items-center gap-6">
                <Logo onClick={goHome} className="mr-2" />
                <button
                    onClick={goHome}
                    className={`text-xl font-extrabold tracking-tight pb-1 border-b-2 transition ${
                        active === 'home'
                            ? 'text-white border-green-500'
                            : 'text-gray-500 border-transparent hover:text-white'
                    }`}
                >
                    Inicio
                </button>
                <button
                    onClick={() => navigate('/watchlist')}
                    className={`flex items-center gap-1.5 text-xl font-extrabold tracking-tight pb-1 border-b-2 transition ${
                        active === 'watchlist'
                            ? 'text-white border-green-500'
                            : 'text-gray-500 border-transparent hover:text-white'
                    }`}
                >
                    <Bookmark className="w-4 h-4" />
                    Watchlist
                </button>
            </nav>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {children}
            </div>
        </header>
    )
}
