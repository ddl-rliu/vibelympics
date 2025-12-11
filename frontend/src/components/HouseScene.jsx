import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import PropTypes from 'prop-types'
import * as THREE from 'three'

// Pastel colors for houses
const HOUSE_COLORS = ['#FCCCC7', '#E3AFBD', '#FAF7E4', '#BBE3F0', '#F4D4B2']

// Get severity color
function getSeverityColor(severity) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return '#dc2626'
    case 'HIGH': return '#ea580c'
    case 'MODERATE': return '#f59e0b'
    case 'LOW': return '#84cc16'
    default: return '#6b7280'
  }
}

// Get fire scale based on severity (0.5x to 2x)
function getFireScale(severity) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 2.0
    case 'HIGH': return 1.5
    case 'MODERATE': return 1.0
    case 'LOW': return 0.5
    default: return 0.75
  }
}

// Individual Fire component with transparency and varied sizes
function Fire({ position, intensity = 1, severity, vulnInfo, scale = 1 }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Animate flame
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.scale.y = 1 + Math.sin(time * 8 + position[0]) * 0.2
      meshRef.current.scale.x = 1 + Math.sin(time * 6 + position[0] * 2) * 0.15
    }
  })

  // Base size multiplied by severity scale (0.5x to 2x)
  const severityScale = getFireScale(severity) * scale
  const baseSize = 0.06
  const baseHeight = 0.15
  const flameSize = baseSize * severityScale
  const flameHeight = baseHeight * severityScale

  return (
    <group position={position}>
      {/* Black outline */}
      <mesh position={[0, 0, -0.01]}>
        <coneGeometry args={[flameSize + 0.03, flameHeight + 0.06, 8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      
      {/* Outer red */}
      <mesh>
        <coneGeometry args={[flameSize + 0.02, flameHeight + 0.04, 8]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.85} />
      </mesh>
      
      {/* Orange layer */}
      <mesh ref={meshRef} position={[0, 0.01, 0]}>
        <coneGeometry args={[flameSize + 0.01, flameHeight + 0.02, 8]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
      </mesh>
      
      {/* Yellow core */}
      <mesh 
        position={[0, 0.02, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <coneGeometry args={[flameSize, flameHeight, 8]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.95} />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && vulnInfo && (
        <Html position={[0, flameHeight + 0.15, 0]} center>
          <div className="bg-gray-900/95 text-white p-2 rounded shadow-xl min-w-[180px] max-w-[250px] pointer-events-none text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{ backgroundColor: getSeverityColor(severity) }}
              >
                {severity || 'UNKNOWN'}
              </span>
            </div>
            <p className="font-mono text-orange-300 text-[10px]">{vulnInfo.id}</p>
            <p className="mt-1 text-white/80 line-clamp-2">{vulnInfo.summary}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

Fire.propTypes = {
  position: PropTypes.array.isRequired,
  intensity: PropTypes.number,
  severity: PropTypes.string,
  vulnInfo: PropTypes.object,
  scale: PropTypes.number,
}

// Face component for house
function HouseFace({ vulnCount, position }) {
  const eyeRadius = 0.06
  const eyeDistance = 0.15

  return (
    <group position={position}>
      {/* Left eye */}
      <mesh position={[-eyeDistance, 0.08, 0.01]}>
        <circleGeometry args={[eyeRadius, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Right eye */}
      <mesh position={[eyeDistance, 0.08, 0.01]}>
        <circleGeometry args={[eyeRadius, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Mouth based on vulnerability count */}
      {vulnCount === 0 ? (
        // Happy smile
        <mesh position={[0, -0.1, 0.01]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ) : vulnCount <= 2 ? (
        // Grim flat line
        <mesh position={[0, -0.1, 0.01]}>
          <boxGeometry args={[0.2, 0.03, 0.01]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ) : (
        // Horrified open mouth
        <mesh position={[0, -0.12, 0.01]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      )}
    </group>
  )
}

HouseFace.propTypes = {
  vulnCount: PropTypes.number.isRequired,
  position: PropTypes.array.isRequired,
}

// Malicious sign component
function MaliciousSign({ summary }) {
  return (
    <group position={[0, 0.15, 0.5]}>
      {/* Sign post */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>
      
      {/* Sign board */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.25, 0.03]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      
      {/* Sign text */}
      <Text
        position={[0, 0.1, 0.02]}
        fontSize={0.04}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.55}
        textAlign="center"
        fontWeight="bold"
      >
        {summary?.substring(0, 50) || 'MALICIOUS'}
      </Text>
    </group>
  )
}

MaliciousSign.propTypes = {
  summary: PropTypes.string,
}

// Single house component
function House({ position, color, version, vulns, onClick, isSelected, isMalicious, maliciousSummary }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.08 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const vulnCount = vulns.length

  // Seeded random for consistent positioning per house
  const seededRandom = useCallback((seed) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }, [])

  // Position fires with noise - roof fires and overflow to floor
  const { roofFires, floorFires } = useMemo(() => {
    const roofArr = []
    const floorArr = []
    const maxRoofFires = 4 // Max fires on roof before overflowing to floor
    
    vulns.forEach((vuln, i) => {
      // Add noise to positions using seeded random
      const seed = i * 137 + (vuln.id?.charCodeAt(0) || 0)
      const noiseX = (seededRandom(seed) - 0.5) * 0.3
      const noiseZ = (seededRandom(seed + 1) - 0.5) * 0.25
      
      let intensity = 0.5
      switch (vuln.severity?.toUpperCase()) {
        case 'CRITICAL': intensity = 1; break
        case 'HIGH': intensity = 0.8; break
        case 'MODERATE': intensity = 0.5; break
        case 'LOW': intensity = 0.3; break
      }

      if (i < maxRoofFires) {
        // Position on roof with noise
        const spacing = 0.22
        const startX = -((Math.min(vulns.length, maxRoofFires) - 1) * spacing) / 2
        const baseX = startX + i * spacing
        
        roofArr.push({
          position: [baseX + noiseX, 1.05 + noiseZ * 0.1, noiseZ],
          intensity,
          severity: vuln.severity,
          vulnInfo: vuln,
          scale: 1,
        })
      } else {
        // Overflow fires go on floor around the house
        const floorIndex = i - maxRoofFires
        const angle = (floorIndex / (vulns.length - maxRoofFires)) * Math.PI * 2 + seededRandom(seed + 2) * 0.5
        const radius = 0.5 + seededRandom(seed + 3) * 0.3
        const floorX = Math.cos(angle) * radius + noiseX * 0.2
        const floorZ = Math.sin(angle) * radius * 0.6 + 0.3 + noiseZ * 0.2
        
        floorArr.push({
          position: [floorX, 0.01, floorZ],
          intensity,
          severity: vuln.severity,
          vulnInfo: vuln,
          scale: 0.7, // Slightly smaller on floor
        })
      }
    })
    
    return { roofFires: roofArr, floorFires: floorArr }
  }, [vulns, seededRandom])

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick && onClick(version)
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* House body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Black outline */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.72, 0.72, 0.52]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.55, 0.4, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Roof outline */}
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.56, 0.41, 4]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>

      {/* Door - made transparent to not overlap face */}
      <mesh position={[0, 0.12, 0.26]}>
        <boxGeometry args={[0.15, 0.22, 0.02]} />
        <meshStandardMaterial color="#5c3317" transparent opacity={0.3} />
      </mesh>

      {/* Door handle - subtle */}
      <mesh position={[0.04, 0.12, 0.28]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} transparent opacity={0.4} />
      </mesh>

      {/* Face on front of house */}
      <HouseFace vulnCount={vulnCount} position={[0, 0.45, 0.26]} />

      {/* Fires on roof */}
      {roofFires.map((fire, i) => (
        <Fire 
          key={`roof-${i}`} 
          position={fire.position} 
          intensity={fire.intensity}
          severity={fire.severity}
          vulnInfo={fire.vulnInfo}
          scale={fire.scale}
        />
      ))}

      {/* Overflow fires on floor around the house */}
      {floorFires.map((fire, i) => (
        <Fire 
          key={`floor-${i}`} 
          position={fire.position} 
          intensity={fire.intensity}
          severity={fire.severity}
          vulnInfo={fire.vulnInfo}
          scale={fire.scale}
        />
      ))}

      {/* Malicious sign */}
      {isMalicious && <MaliciousSign summary={maliciousSummary} />}

      {/* Version label UNDER the house */}
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.1}
        color={isSelected ? '#f97316' : '#374151'}
        anchorX="center"
        anchorY="top"
        outlineWidth={0.005}
        outlineColor="#ffffff"
      >
        {version.length > 10 ? version.substring(0, 8) + '..' : version}
      </Text>

      {/* Click indicator */}
      {hovered && (
        <Html position={[0, 1.4, 0]} center>
          <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold animate-bounce whitespace-nowrap">
            Click to enter
          </div>
        </Html>
      )}
    </group>
  )
}

House.propTypes = {
  position: PropTypes.array.isRequired,
  color: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  vulns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
  isMalicious: PropTypes.bool,
  maliciousSummary: PropTypes.string,
}

// Ground plane - positioned to cover all houses
function Ground({ isMalicious, totalWidth }) {
  // Make ground wide enough to cover all houses plus extra buffer
  const groundWidth = Math.max(200, totalWidth + 50)
  const groundCenterX = totalWidth / 2
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[groundCenterX, 0, 0]} receiveShadow>
      <planeGeometry args={[groundWidth, 30]} />
      <meshStandardMaterial 
        color={isMalicious ? '#7f1d1d' : '#e5e7eb'} 
        roughness={0.9}
      />
    </mesh>
  )
}

Ground.propTypes = {
  isMalicious: PropTypes.bool,
  totalWidth: PropTypes.number,
}

// Background fires for malicious packages
function BackgroundFires() {
  const fires = useMemo(() => {
    const result = []
    for (let i = 0; i < 30; i++) {
      result.push({
        position: [
          (Math.random() - 0.5) * 60,
          0.1 + Math.random() * 0.3,
          -4 - Math.random() * 8,
        ],
        intensity: 0.2 + Math.random() * 0.4,
      })
    }
    return result
  }, [])

  return (
    <>
      {fires.map((fire, i) => (
        <Fire 
          key={i} 
          position={fire.position} 
          intensity={fire.intensity}
          severity="HIGH"
        />
      ))}
    </>
  )
}

// Camera controller for horizontal scrolling
function CameraController({ scrollOffset, totalVersions }) {
  const { camera } = useThree()
  
  useFrame(() => {
    // Move camera horizontally based on scroll
    const targetX = scrollOffset
    camera.position.x += (targetX - camera.position.x) * 0.08
    camera.lookAt(camera.position.x, 0.5, 0)
  })

  return null
}

CameraController.propTypes = {
  scrollOffset: PropTypes.number.isRequired,
  totalVersions: PropTypes.number.isRequired,
}

// Check if a version looks like a commit hash (hex string without dots)
function isCommitHash(version) {
  if (!version || typeof version !== 'string') return false
  // Commit hashes are hex strings (a-f, 0-9), typically 7-40 chars, no dots or other punctuation
  // Real versions typically have dots like "1.0.0", "2.3.4"
  if (version.includes('.')) return false
  if (version.length < 6) return false
  // Check if it's mostly hex characters
  const hexPattern = /^[a-f0-9]+$/i
  return hexPattern.test(version)
}

// Main scene component
function Scene({ auditData, selectedVersion, onHouseClick, scrollOffset }) {
  // Get versions to display - filter out commit hashes
  const versions = useMemo(() => {
    if (!auditData?.versions || auditData.versions.length === 0) {
      return [selectedVersion || '1.0.0']
    }
    // Filter out versions that look like commit hashes
    const filtered = auditData.versions.filter(v => !isCommitHash(v))
    return filtered.length > 0 ? filtered : auditData.versions
  }, [auditData, selectedVersion])

  // Get vulnerabilities for a specific version
  const getVulnsForVersion = useCallback((version) => {
    if (!auditData?.vulnerabilities) return []
    return auditData.vulnerabilities.filter(vuln => {
      if (vuln.affected_versions?.includes(version)) return true
      if (vuln.introduced && vuln.fixed) {
        return version >= vuln.introduced && version < vuln.fixed
      }
      if (vuln.introduced && !vuln.fixed) {
        return version >= vuln.introduced
      }
      return true
    })
  }, [auditData])

  const isMalicious = auditData?.is_malicious
  const totalWidth = versions.length * 1.5 // spacing between houses

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Camera controller */}
      <CameraController scrollOffset={scrollOffset} totalVersions={versions.length} />

      {/* Ground */}
      <Ground isMalicious={isMalicious} totalWidth={totalWidth} />

      {/* Background fires for malicious packages */}
      {isMalicious && <BackgroundFires />}

      {/* Houses in a horizontal line */}
      {versions.map((version, index) => {
        const vulns = getVulnsForVersion(version)
        const spacing = 1.5 // Space between houses
        return (
          <House
            key={version + index}
            position={[index * spacing, 0, 0]}
            color={HOUSE_COLORS[index % HOUSE_COLORS.length]}
            version={version}
            vulns={vulns}
            onClick={onHouseClick}
            isSelected={version === selectedVersion}
            isMalicious={isMalicious}
            maliciousSummary={isMalicious ? auditData?.malicious_details?.summary : null}
          />
        )
      })}
    </>
  )
}

Scene.propTypes = {
  auditData: PropTypes.object,
  selectedVersion: PropTypes.string,
  onHouseClick: PropTypes.func,
  scrollOffset: PropTypes.number.isRequired,
}

// Main exported component
function HouseScene({ auditData, selectedVersion, onHouseClick }) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const containerRef = useRef()

  // Filter out commit hashes from versions
  const versions = useMemo(() => {
    const allVersions = auditData?.versions || []
    const filtered = allVersions.filter(v => !isCommitHash(v))
    return filtered.length > 0 ? filtered : allVersions
  }, [auditData])
  
  const maxScroll = Math.max(0, (versions.length - 1) * 1.5)

  // Find selected version index and set initial scroll
  useEffect(() => {
    if (selectedVersion && versions.length > 0) {
      const idx = versions.indexOf(selectedVersion)
      if (idx >= 0) {
        setScrollOffset(idx * 1.5)
      } else {
        // Default to last version
        setScrollOffset((versions.length - 1) * 1.5)
      }
    }
  }, [selectedVersion, versions])

  // Handle scroll/wheel events
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    setScrollOffset(prev => {
      const delta = e.deltaY * 0.01
      return Math.max(0, Math.min(maxScroll, prev + delta))
    })
  }, [maxScroll])

  // Handle slider change
  const handleSliderChange = useCallback((e) => {
    const value = parseFloat(e.target.value)
    setScrollOffset(value)
  }, [])

  const isMalicious = auditData?.is_malicious

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px]"
      style={{ backgroundColor: isMalicious ? '#dc2626' : '#FAFBFD' }}
      onWheel={handleWheel}
    >
      {/* Malicious package warning */}
      {isMalicious && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-700 text-white px-6 py-3 rounded-lg shadow-xl border-2 border-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-lg">MALICIOUS PACKAGE DETECTED</p>
                <p className="text-sm opacity-90">
                  {auditData.malicious_details?.summary || 'This package has been flagged as malicious'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 6], fov: 45 }}
        shadows
        className="cursor-grab active:cursor-grabbing"
      >
        <Scene 
          auditData={auditData}
          selectedVersion={selectedVersion}
          onHouseClick={onHouseClick}
          scrollOffset={scrollOffset}
        />
      </Canvas>

      {/* Navigation controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 max-w-xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm font-medium whitespace-nowrap">
              {versions.length} versions
            </span>
            <input
              type="range"
              min="0"
              max={maxScroll || 1}
              step="0.1"
              value={scrollOffset}
              onChange={handleSliderChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <span className="text-gray-500 text-xs whitespace-nowrap">
              Scroll to navigate
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

HouseScene.propTypes = {
  auditData: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  onHouseClick: PropTypes.func.isRequired,
}

export default HouseScene
