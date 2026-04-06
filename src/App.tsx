/**
 * 메인 애플리케이션 컴포넌트
 * 역할 기반 라우팅과 보호된 라우트를 설정합니다.
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, RoleBasedHome } from './auth'
import { Layout } from './components'
import { LoginPage, UnauthorizedPage } from './pages'
import './App.css'

/**
 * 앱 컴포넌트
 */
function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* 역할 기반 홈 리다이렉트 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedHome />
              </ProtectedRoute>
            }
          />

          {/* TODO: F2-F6 기능 구현 시 추가될 라우트 */}

          {/* 404 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
