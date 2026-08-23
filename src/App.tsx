import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { UniverseList } from './pages/UniverseList'
import { EntityDetail } from './pages/EntityDetail'
import { PlanningList } from './pages/PlanningList'
import { PlanDetail } from './pages/PlanDetail'
import { EngagementList } from './pages/EngagementList'
import { EngagementDetail } from './pages/EngagementDetail'
import { FindingsList } from './pages/FindingsList'
import { NewFinding } from './pages/NewFinding'
import { CorrectiveActions } from './pages/CorrectiveActions'
import { ReportsList } from './pages/ReportsList'
import { ReportDetail } from './pages/ReportDetail'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/universe" element={<UniverseList />} />
        <Route path="/universe/:entityId" element={<EntityDetail />} />
        <Route path="/planning" element={<PlanningList />} />
        <Route path="/planning/:planId" element={<PlanDetail />} />
        <Route path="/engagements" element={<EngagementList />} />
        <Route path="/engagements/:engagementId" element={<EngagementDetail />} />
        <Route path="/findings" element={<FindingsList />} />
        <Route path="/findings/new" element={<NewFinding />} />
        <Route path="/corrective-actions" element={<CorrectiveActions />} />
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/reports/:reportId" element={<ReportDetail />} />
      </Route>
    </Routes>
  )
}
