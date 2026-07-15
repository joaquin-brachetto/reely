import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { WatchlistProvider } from './context/WatchlistContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import PersonDetailPage from './pages/PersonDetailPage'
import WatchlistPage from './pages/WatchlistPage'

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
          </BrowserRouter>
        </WatchlistProvider>
      </PreferencesProvider>
    </AuthProvider>
  )
}

