/**
 * 메인 애플리케이션 컴포넌트
 * 역할 기반 라우팅과 보호된 라우트를 설정합니다.
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, RoleBasedHome } from './auth'
import { Layout } from './components'
import { LoginPage, UnauthorizedPage, TeacherHomePage, MaterialUploadPage, MaterialStatusPage, TeacherWorkspacePage, QuestionGeneratePage, QuestionReviewPage, TeacherDashboardPage, StudentHomePage, JoinPage, StudentWorkspacePage, QuestionSetPage, SubmissionResultPage, QAPage, OperatorOverviewPage } from './pages'
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

          <Route
            path="/teacher"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <TeacherHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/materials/new"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <MaterialUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/materials/:materialId"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <MaterialStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/materials/:materialId/workspace"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <TeacherWorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/materials/:materialId/generate"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <QuestionGeneratePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/question-sets/:questionSetId/review"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <QuestionReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/question-sets/:questionSetId/dashboard"
            element={
              <ProtectedRoute roles={['TEACHER']}>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentHomePage /></ProtectedRoute>} />
          <Route path="/student/join" element={<ProtectedRoute roles={['STUDENT']}><JoinPage /></ProtectedRoute>} />
          <Route path="/student/question-sets/:distributionCode/workspace" element={<ProtectedRoute roles={['STUDENT']}><StudentWorkspacePage /></ProtectedRoute>} />
          <Route path="/student/question-sets/:distributionCode" element={<ProtectedRoute roles={['STUDENT']}><QuestionSetPage /></ProtectedRoute>} />
          <Route path="/student/submissions/:submissionId" element={<ProtectedRoute roles={['STUDENT']}><SubmissionResultPage /></ProtectedRoute>} />
          <Route path="/student/materials/:materialId/qa" element={<ProtectedRoute roles={['STUDENT']}><QAPage /></ProtectedRoute>} />
          <Route path="/operator" element={<ProtectedRoute roles={['OPERATOR']}><OperatorOverviewPage /></ProtectedRoute>} />

          {/* 404 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
