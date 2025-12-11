import { useState } from 'react'
import PropTypes from 'prop-types'

const ECOSYSTEMS = [
  { value: 'PyPI', label: 'PyPI (Python)' },
  { value: 'npm', label: 'npm (JavaScript)' },
  { value: 'Maven', label: 'Maven (Java)' },
  { value: 'Go', label: 'Go' },
]

function SearchForm({ onSearch, loading }) {
  const [ecosystem, setEcosystem] = useState('PyPI')
  const [packageName, setPackageName] = useState('')
  const [version, setVersion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!ecosystem || !packageName) {
      return
    }
    onSearch({
      ecosystem,
      name: packageName,
      version: version || null,
    })
  }

  const isValid = ecosystem && packageName

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-gradient-to-b from-gray-900/80 to-gray-800/60 backdrop-blur-sm border-b border-white/10 py-6 px-4"
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-end gap-4 justify-center">
        {/* Ecosystem Dropdown */}
        <div className="flex flex-col">
          <label htmlFor="ecosystem" className="text-white/80 text-sm mb-2 font-body">
            Ecosystem
          </label>
          <select
            id="ecosystem"
            value={ecosystem}
            onChange={(e) => setEcosystem(e.target.value)}
            className="bg-gray-800 text-white border-2 border-orange-400/50 rounded-lg px-4 py-3 font-body
                       focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30
                       transition-all duration-200 min-w-[180px]"
            required
          >
            <option value="">Select ecosystem...</option>
            {ECOSYSTEMS.map((eco) => (
              <option key={eco.value} value={eco.value}>
                {eco.label}
              </option>
            ))}
          </select>
        </div>

        {/* Package Name Input */}
        <div className="flex flex-col flex-1 min-w-[200px] max-w-md">
          <label htmlFor="packageName" className="text-white/80 text-sm mb-2 font-body">
            Package Name
          </label>
          <input
            id="packageName"
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="e.g., urllib3, flask, requests"
            className="bg-gray-800 text-white border-2 border-orange-400/50 rounded-lg px-4 py-3 font-body
                       focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30
                       transition-all duration-200 placeholder:text-white/30"
            required
          />
        </div>

        {/* Version Input (Optional) */}
        <div className="flex flex-col">
          <label htmlFor="version" className="text-white/80 text-sm mb-2 font-body">
            Version <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="version"
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g., 1.26.0"
            className="bg-gray-800 text-white border-2 border-orange-400/50 rounded-lg px-4 py-3 font-body
                       focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30
                       transition-all duration-200 placeholder:text-white/30 w-[140px]"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`search-btn bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 
                     text-white font-display text-lg px-8 py-3 rounded-lg
                     transform transition-all duration-200
                     ${isValid && !loading 
                       ? 'hover:scale-105 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 cursor-pointer' 
                       : 'opacity-50 cursor-not-allowed'}
                     disabled:hover:scale-100`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 loader" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning...
            </span>
          ) : (
            '🔥 Audit Package'
          )}
        </button>
      </div>
    </form>
  )
}

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default SearchForm

