import { useState, useCallback, useEffect } from 'react'
import SearchForm from './components/SearchForm'
import HouseScene from './components/HouseScene'
import VulnerabilityView from './components/VulnerabilityView'

function App() {
  const [auditData, setAuditData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [viewingHouse, setViewingHouse] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [initialSearchDone, setInitialSearchDone] = useState(false)
  const [autoViewDetails, setAutoViewDetails] = useState(false)

  const handleSearch = useCallback(async (searchParams) => {
    console.log('Searching for package:', searchParams)
    setLoading(true)
    setError(null)
    setAuditData(null)
    setViewingHouse(false)
    setSelectedVersion(searchParams.version || null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ecosystem: searchParams.ecosystem,
          name: searchParams.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to audit package')
      }

      const data = await response.json()
      console.log('Audit data received:', data)
      setAuditData(data)
      
      // If version was specified, use it; otherwise use the latest version
      if (searchParams.version) {
        setSelectedVersion(searchParams.version)
      } else if (data.versions && data.versions.length > 0) {
        // Get the last version (newest)
        setSelectedVersion(data.versions[data.versions.length - 1])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleHouseClick = useCallback((version) => {
    console.log('Entering house for version:', version)
    setSelectedVersion(version)
    setViewingHouse(true)
  }, [])

  const handleBackOut = useCallback(() => {
    console.log('Backing out of house')
    setFadeOut(true)
    setTimeout(() => {
      setViewingHouse(false)
      setFadeOut(false)
    }, 500)
  }, [])

  // Auto-search from URL params on load (for testing and demo)
  // Supports: ?package=name&ecosystem=PyPI&version=1.0.0&view=details
  useEffect(() => {
    if (initialSearchDone) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const packageName = urlParams.get('package')
    const ecosystem = urlParams.get('ecosystem') || 'PyPI'
    const version = urlParams.get('version')
    const view = urlParams.get('view')
    
    if (packageName) {
      console.log('Auto-searching from URL params:', { ecosystem, packageName, version, view })
      setInitialSearchDone(true)
      
      // If view=details, set flag to auto-navigate after data loads
      if (view === 'details') {
        setAutoViewDetails(true)
        if (version) {
          setSelectedVersion(version)
        }
      }
      
      handleSearch({
        ecosystem,
        name: packageName,
        version: version || null,
      })
    }
  }, [initialSearchDone, handleSearch])

  // Auto-navigate to details view after data loads if requested
  useEffect(() => {
    if (autoViewDetails && auditData && !loading && selectedVersion) {
      setViewingHouse(true)
      setAutoViewDetails(false)
    }
  }, [autoViewDetails, auditData, loading, selectedVersion])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 py-4 px-6 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-display text-white text-center drop-shadow-lg tracking-wide">
          🏠 Flaming Hot Auditor 🔥
        </h1>
        <p className="text-center text-white/90 text-sm mt-1 font-body">
          Package vulnerability detection with style
        </p>
      </header>

      {/* Search Form */}
      <SearchForm onSearch={handleSearch} loading={loading} />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Error Display */}
        {error && (
          <div className="absolute inset-x-0 top-4 flex justify-center z-50">
            <div className="bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-xl backdrop-blur-sm">
              <p className="font-body">⚠️ {error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-red-500 rounded-full loader"></div>
            <p className="mt-4 text-white/80 font-body">Scanning for vulnerabilities...</p>
          </div>
        )}

        {/* Initial State - No Data */}
        {!loading && !auditData && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white/90 text-xl font-body mb-2">
              Search for a package to begin
            </p>
            <p className="text-white/60 font-body text-sm max-w-md">
              Select an ecosystem, enter a package name, and optionally specify a version.
              We&apos;ll show you the vulnerability landscape!
            </p>
          </div>
        )}

        {/* House Scene View */}
        {!loading && auditData && !viewingHouse && (
          <HouseScene 
            auditData={auditData}
            selectedVersion={selectedVersion}
            onHouseClick={handleHouseClick}
          />
        )}

        {/* Vulnerability Detail View (Inside House) */}
        {!loading && auditData && viewingHouse && (
          <div className={`transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <VulnerabilityView
              auditData={auditData}
              version={selectedVersion}
              onBack={handleBackOut}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 py-2 px-4 text-center">
        <p className="text-white/50 text-xs font-body">
          Built for Chainguard Vibelympics • Powered by OSV API
        </p>
      </footer>
    </div>
  )
}

export default App

