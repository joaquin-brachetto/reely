import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { lazy, Suspense } from 'react'
import TopProgressBar from './components/layout/TopProgressBar'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'))
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'))

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <Suspense fallback={<TopProgressBar />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                } />
                <Route path="/person/:id" element={
                  <PrivateRoute>
                    <PersonDetailPage />
                  </PrivateRoute>
                } />
                <Route path="/watchlist" element={
                  <PrivateRoute>
                    <WatchlistPage />
                  </PrivateRoute>
                } />
                <Route path="/:mediaType/:id" element={<MovieDetailPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </WatchlistProvider>
      </PreferencesProvider>
    </AuthProvider>
  )
}

