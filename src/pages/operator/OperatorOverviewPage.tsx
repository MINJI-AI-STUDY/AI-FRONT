/**
 * 운영자 대시보드 페이지
 * F5: 운영자 요약 대시보드
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { createAdminUser, createClassroom, createSchool, getAdminUsers, getClassrooms, getOperatorOverview, getSchools, syncSchoolMaster, updateAdminUser, updateSchool, type AdminUserResponse, type ClassroomResponse, type OperatorOverviewResponse, type SchoolResponse } from '../../api/operator'
import './OperatorPages.css'

export function OperatorOverviewPage() {
  const [overview, setOverview] = useState<OperatorOverviewResponse | null>(null)
  const [schools, setSchools] = useState<SchoolResponse[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('')
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([])
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [newSchoolName, setNewSchoolName] = useState('')
  const [newClassroomName, setNewClassroomName] = useState('')
  const [newClassroomGrade, setNewClassroomGrade] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserLoginId, setNewUserLoginId] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<'TEACHER' | 'STUDENT' | 'OPERATOR'>('TEACHER')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const { user, token, logout } = useAuth()

  const reloadSchoolDetails = async (schoolId: string) => {
    if (!token || !schoolId) return
    const [schoolData, classroomData, userData] = await Promise.all([
      getSchools(token),
      getClassrooms(schoolId, token),
      getAdminUsers(token, schoolId),
    ])
    setSchools(schoolData)
    setClassrooms(classroomData)
    setUsers(userData)
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('로그인이 필요합니다.')
      return
    }

    const fetchOverview = async () => {
      try {
        const [overviewData, schoolData] = await Promise.all([
          getOperatorOverview(token),
          getSchools(token),
        ])
        setOverview(overviewData)
        setSchools(schoolData)
        const initialSchoolId = schoolData[0]?.schoolId ?? ''
        setSelectedSchoolId(initialSchoolId)
        if (initialSchoolId) {
          const [classroomData, userData] = await Promise.all([
            getClassrooms(initialSchoolId, token),
            getAdminUsers(token, initialSchoolId),
          ])
          setClassrooms(classroomData)
          setUsers(userData)
        }
      } catch (err) {
        console.error('개요 조회 실패:', err)
        setError('데이터를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [token])

  useEffect(() => {
    if (!token || !selectedSchoolId) return

    const fetchSchoolDetails = async () => {
      try {
        const [classroomData, userData] = await Promise.all([
          getClassrooms(selectedSchoolId, token),
          getAdminUsers(token, selectedSchoolId),
        ])
        setClassrooms(classroomData)
        setUsers(userData)
      } catch (err) {
        console.error('학교 상세 조회 실패:', err)
      }
    }

    fetchSchoolDetails()
  }, [selectedSchoolId, token])

  const handleLogout = async () => {
    await logout()
  }

  const handleCreateSchool = async () => {
    if (!token || !newSchoolName.trim()) return
    await createSchool({ name: newSchoolName.trim() }, token)
    setNewSchoolName('')
    const schoolData = await getSchools(token)
    setSchools(schoolData)
  }

  const handleCreateClassroom = async () => {
    if (!token || !selectedSchoolId || !newClassroomName.trim()) return
    await createClassroom(selectedSchoolId, { name: newClassroomName.trim(), grade: newClassroomGrade ? Number(newClassroomGrade) : null }, token)
    setNewClassroomName('')
    setNewClassroomGrade('')
    await reloadSchoolDetails(selectedSchoolId)
  }

  const handleCreateUser = async () => {
    if (!token || !selectedSchoolId || !newUserName.trim() || !newUserLoginId.trim() || !newUserPassword.trim()) return
    await createAdminUser({
      schoolId: selectedSchoolId,
      classroomId: classrooms[0]?.classroomId ?? null,
      loginId: newUserLoginId.trim(),
      password: newUserPassword,
      displayName: newUserName.trim(),
      role: newUserRole,
    }, token)
    setNewUserName('')
    setNewUserLoginId('')
    setNewUserPassword('')
    await reloadSchoolDetails(selectedSchoolId)
  }

  const handleToggleUser = async (target: AdminUserResponse) => {
    if (!token) return
    await updateAdminUser(target.userId, {
      schoolId: target.schoolId,
      classroomId: target.classroomId,
      displayName: target.displayName,
      role: target.role,
      active: !target.active,
    }, token)
    await reloadSchoolDetails(target.schoolId)
  }

  const handleToggleSchool = async (target: SchoolResponse) => {
    if (!token) return
    await updateSchool(target.schoolId, { name: target.name, active: !target.active }, token)
    const schoolData = await getSchools(token)
    setSchools(schoolData)
  }

  const handleSyncSchoolMaster = async () => {
    if (!token) return
    try {
      const result = await syncSchoolMaster(token)
      setSyncMessage(`학교 마스터 동기화 완료: 신규 ${result.importedCount}건, 업데이트 ${result.updatedCount}건`)
      const schoolData = await getSchools(token)
      setSchools(schoolData)
    } catch (err) {
      console.error('학교 마스터 동기화 실패:', err)
      setSyncMessage('학교 마스터 동기화에 실패했습니다. API 키를 확인해주세요.')
    }
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error || !overview) return <div className="error-container"><p>{error || '데이터를 찾을 수 없습니다.'}</p></div>

  const hasOverviewData = overview.averageScore > 0 || overview.participationRate > 0 || overview.completionRate > 0

  return (
    <div className="operator-overview-page">
      <div className="page-header">
        <h1 className="page-title">운영자 대시보드</h1>
        <p className="page-description">안녕하세요, {user?.displayName}님. 전체 현황을 확인하세요.</p>
        <Button variant="outline" onClick={handleLogout}>로그아웃</Button>
      </div>

      <Card className="summary-card" style={{ marginBottom: '1rem' }}>
        <CardBody>
          <h3 className="summary-title">학교 마스터 동기화</h3>
          <Button variant="outline" onClick={handleSyncSchoolMaster}>Open API로 학교 동기화</Button>
          {syncMessage && <p className="page-description" style={{ marginTop: '0.75rem' }}>{syncMessage}</p>}
        </CardBody>
      </Card>

      {!hasOverviewData ? (
        <Card className="summary-card">
          <CardBody>
            <div className="empty-state">
              <h3 className="summary-title">아직 집계할 데이터가 없습니다</h3>
              <p className="page-description">학생 제출이 누적되면 평균 점수, 참여율, 완료율이 표시됩니다.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="summary-grid">
          <Card className="summary-card"><CardBody><h3 className="summary-title">평균 점수</h3><p className="summary-value">{overview.averageScore.toFixed(1)}점</p></CardBody></Card>
          <Card className="summary-card"><CardBody><h3 className="summary-title">참여율</h3><p className="summary-value">{overview.participationRate.toFixed(1)}%</p></CardBody></Card>
          <Card className="summary-card"><CardBody><h3 className="summary-title">완료율</h3><p className="summary-value">{overview.completionRate.toFixed(1)}%</p></CardBody></Card>
        </div>
      )}

      <Card className="summary-card" style={{ marginTop: '1.5rem' }}>
        <CardBody>
          <h3 className="summary-title">학교/학급/사용자 관리</h3>
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} placeholder="새 학교 이름" />
              <Button variant="outline" onClick={handleCreateSchool}>학교 추가</Button>
            </div>
            <label>
              학교 선택
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', minWidth: '240px' }}
              >
                {schools.map((school) => (
                  <option key={school.schoolId} value={school.schoolId}>{school.name}</option>
                ))}
              </select>
            </label>
            <div style={{ marginTop: '0.75rem' }}>
              {schools.find((school) => school.schoolId === selectedSchoolId) && (
                <Button variant="outline" onClick={() => handleToggleSchool(schools.find((school) => school.schoolId === selectedSchoolId)!)}>
                  {schools.find((school) => school.schoolId === selectedSchoolId)?.active ? '학교 비활성화' : '학교 활성화'}
                </Button>
              )}
            </div>
          </div>

          <div className="summary-grid">
            <Card className="summary-card"><CardBody><h3 className="summary-title">학급 수</h3><p className="summary-value">{classrooms.length}</p></CardBody></Card>
            <Card className="summary-card"><CardBody><h3 className="summary-title">사용자 수</h3><p className="summary-value">{users.length}</p></CardBody></Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <h4 className="summary-title">학급 목록</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input value={newClassroomName} onChange={(e) => setNewClassroomName(e.target.value)} placeholder="새 학급 이름" />
                <input value={newClassroomGrade} onChange={(e) => setNewClassroomGrade(e.target.value)} placeholder="학년" />
                <Button variant="outline" onClick={handleCreateClassroom}>학급 추가</Button>
              </div>
              {classrooms.length === 0 ? <p className="page-description">학급이 없습니다.</p> : (
                <ul>
                  {classrooms.map((classroom) => (
                    <li key={classroom.classroomId}>{classroom.name}{classroom.grade ? ` (${classroom.grade}학년)` : ''}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="summary-title">사용자 목록</h4>
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="사용자 이름" />
                <input value={newUserLoginId} onChange={(e) => setNewUserLoginId(e.target.value)} placeholder="로그인 ID" />
                <input value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="임시 비밀번호" type="password" />
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'TEACHER' | 'STUDENT' | 'OPERATOR')}>
                  <option value="TEACHER">교사</option>
                  <option value="STUDENT">학생</option>
                  <option value="OPERATOR">운영자</option>
                </select>
                <Button variant="outline" onClick={handleCreateUser}>사용자 추가</Button>
              </div>
              {users.length === 0 ? <p className="page-description">사용자가 없습니다.</p> : (
                <ul>
                  {users.map((item) => (
                    <li key={item.userId}>{item.displayName} · {item.role} · {item.loginId} · {item.active ? '활성' : '비활성'} <button onClick={() => handleToggleUser(item)}>{item.active ? '비활성화' : '활성화'}</button></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
