import { BrowserRouter, HashRouter, Navigate, Route, Routes, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './error-boundary'
import { StudyProvider } from '@/features/study/store'
import {
  Layout,
  TodayPage,
  VocabularyPage,
  PracticePage,
  ResourcesPage,
  ProgressPage,
  SettingsPage,
  Action,
} from '@/features/study/pages'
const StudyRouter = import.meta.env.MODE === 'github-pages' ? HashRouter : BrowserRouter
export function App() {
  return (
    <ErrorBoundary>
      <StudyProvider>
        <StudyRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<TodayPage />} />
              <Route path="vocabulary" element={<VocabularyPage />} />
              <Route path="practice" element={<Navigate to="/practice/listening" replace />} />
              <Route path="practice/:kind" element={<PracticePage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="*"
                element={
                  <div className="empty-state">
                    <h1>没有找到这个页面</h1>
                    <p>回到今日学习，继续你的计划。</p>
                    <Action asChild>
                      <Link to="/">返回今日学习</Link>
                    </Action>
                  </div>
                }
              />
            </Route>
          </Routes>
          <Toaster position="bottom-right" closeButton />
        </StudyRouter>
      </StudyProvider>
    </ErrorBoundary>
  )
}
