/**
 * 학교 검색 입력 컴포넌트
 * 검색어 기반 학교 선택을 제공합니다.
 */

import { useEffect, useRef, useState } from 'react'
import { searchSchools, type SchoolMasterResponse } from '../api/signup'
import './SchoolSearchInput.css'

interface SchoolSearchInputProps {
  onChange: (schoolId: string, schoolName: string) => void
  label?: string
  placeholder?: string
  error?: string
}

export function SchoolSearchInput({
  onChange,
  label = '학교',
  placeholder = '학교 이름을 검색하세요',
  error
}: SchoolSearchInputProps) {
  const [keyword, setKeyword] = useState('')
  const [schools, setSchools] = useState<SchoolMasterResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<SchoolMasterResponse | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load initial schools
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true)
        const result = await searchSchools('')
        if (Array.isArray(result)) {
          setSchools(result)
        }
      } catch (err) {
        console.error('학교 목록 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSchools()
  }, [])

  // Search schools when keyword changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        const result = await searchSchools(keyword)
        if (Array.isArray(result)) {
          setSchools(result)
        }
      } catch (err) {
        console.error('학교 검색 실패:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [keyword])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (school: SchoolMasterResponse) => {
    setSelectedSchool(school)
    setKeyword(school.name)
    setIsOpen(false)
    onChange(school.schoolId, school.name)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value
    setKeyword(newKeyword)
    setIsOpen(true)
    if (selectedSchool && newKeyword !== selectedSchool.name) {
      setSelectedSchool(null)
      onChange('', '')
    }
  }

  const displayValue = selectedSchool ? selectedSchool.name : keyword

  const handleClearSelection = () => {
    setSelectedSchool(null)
    setKeyword('')
    setIsOpen(false)
    onChange('', '')
    inputRef.current?.focus()
  }

  return (
    <div className="school-search-input-wrapper" ref={containerRef}>
      {label && <label className="input-label">{label}</label>}
      <div className={`school-search-input-container ${error ? 'has-error' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="school-search-input"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        <span className="material-symbols-outlined school-search-icon">search</span>
        {loading && <span className="school-search-spinner" />}
      </div>
      {selectedSchool ? (
        <div className="school-search-selection-card">
          <div>
            <span className="school-search-selection-label">선택된 학교</span>
            <p className="school-search-selection-name">{selectedSchool.name}</p>
            <span className="school-search-selection-meta">{selectedSchool.schoolLevel} · {selectedSchool.region || '지역 미지정'}</span>
          </div>
          <button type="button" className="school-search-clear" onClick={handleClearSelection}>다시 선택</button>
        </div>
      ) : (
        <p className="school-search-helper">학교 이름을 입력한 뒤, 아래 목록에서 정확한 학교를 한 번 더 선택해주세요.</p>
      )}
      {error && <span className="input-error-text">{error}</span>}
      {isOpen && schools.length > 0 && (
        <div className="school-search-dropdown">
          {schools.map((school) => (
            <button
              key={school.schoolId}
              type="button"
              className={`school-search-option ${selectedSchool?.schoolId === school.schoolId ? 'selected' : ''}`}
              onClick={() => handleSelect(school)}
            >
              <span className="school-search-option-name">{school.name}</span>
              <span className="school-search-option-meta">
                {school.schoolLevel} · {school.region || '지역 미지정'}
              </span>
            </button>
          ))}
        </div>
      )}
      {isOpen && !loading && schools.length === 0 && keyword && (
        <div className="school-search-dropdown">
          <div className="school-search-empty">검색 결과가 없습니다</div>
        </div>
      )}
    </div>
  )
}
