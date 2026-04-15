import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Studies from './pages/Studies';
import StudyDetail from './pages/StudyDetail';
import NewStudy from './pages/NewStudy';
import GenerateStudy from './pages/GenerateStudy';
import EditStudy from './pages/EditStudy';
import Categories from './pages/Categories';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studies"
          element={
            <ProtectedRoute>
              <Studies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studies/new"
          element={
            <ProtectedRoute>
              <NewStudy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studies/generate"
          element={
            <ProtectedRoute>
              <GenerateStudy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studies/:id"
          element={
            <ProtectedRoute>
              <StudyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studies/:id/edit"
          element={
            <ProtectedRoute>
              <EditStudy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
