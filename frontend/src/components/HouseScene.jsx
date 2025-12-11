import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
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

// Fire component - animated flames
function Fire({ position, intensity = 1, severity, vulnInfo, onHover }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Animate flame
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 8 + position[0]) * 0.15
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 6 + position[0] * 2) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.02
    }
  })

  const flameSize = 0.15 + intensity * 0.2
  const flameHeight = 0.3 + intensity * 0.4

  return (
    <group position={position}>
      {/* Outer red glow */}
      <mesh ref={meshRef}>
        <coneGeometry args={[flameSize + 0.1, flameHeight + 0.15, 8]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.6} />
      </mesh>
      
      {/* Orange layer */}
      <mesh position={[0, 0.02, 0]}>
        <coneGeometry args={[flameSize + 0.05, flameHeight + 0.05, 8]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
      </mesh>
      
      {/* Yellow core */}
      <mesh 
        position={[0, 0.04, 0]}
        onPointerOver={() => {
          setHovered(true)
          onHover && onHover(vulnInfo)
        }}
        onPointerOut={() => {
          setHovered(false)
          onHover && onHover(null)
        }}
      >
        <coneGeometry args={[flameSize, flameHeight, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && vulnInfo && (
        <Html position={[0, flameHeight + 0.3, 0]} center>
          <div className="bg-gray-900/95 text-white p-3 rounded-lg shadow-xl min-w-[200px] max-w-[300px] pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{ backgroundColor: getSeverityColor(severity) }}
              >
                {severity || 'UNKNOWN'}
              </span>
              {vulnInfo.score && (
                <span className="text-xs text-white/70">Score: {vulnInfo.score}</span>
              )}
            </div>
            <p className="text-xs font-mono text-orange-300">{vulnInfo.id}</p>
            <p className="text-xs mt-1 text-white/80 line-clamp-2">{vulnInfo.summary}</p>
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
  onHover: PropTypes.func,
}

// Face component for house
function HouseFace({ vulnCount, position }) {
  const eyeRadius = 0.08
  const eyeDistance = 0.2

  return (
    <group position={position}>
      {/* Left eye */}
      <mesh position={[-eyeDistance, 0.1, 0.01]}>
        <circleGeometry args={[eyeRadius, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Right eye */}
      <mesh position={[eyeDistance, 0.1, 0.01]}>
        <circleGeometry args={[eyeRadius, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Mouth based on vulnerability count */}
      {vulnCount === 0 ? (
        // Happy smile - arc
        <mesh position={[0, -0.15, 0.01]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ) : vulnCount <= 2 ? (
        // Grim - flat line
        <mesh position={[0, -0.15, 0.01]}>
          <boxGeometry args={[0.25, 0.04, 0.01]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ) : (
        // Horrified - open scream
        <mesh position={[0, -0.18, 0.01]}>
          <circleGeometry args={[0.12, 16]} />
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

// Single house component
function House({ position, color, version, vulns, onClick, isSelected }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Animate on hover
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.05 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const vulnCount = vulns.length

  // Calculate fire positions based on vulnerabilities
  const fires = useMemo(() => {
    return vulns.slice(0, 5).map((vuln, i) => {
      const angle = (i / Math.min(vulns.length, 5)) * Math.PI * 0.6 - Math.PI * 0.3
      const radius = 0.3
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius * 0.5
      
      // Determine intensity based on severity
      let intensity = 0.5
      switch (vuln.severity?.toUpperCase()) {
        case 'CRITICAL': intensity = 1; break
        case 'HIGH': intensity = 0.8; break
        case 'MODERATE': intensity = 0.5; break
        case 'LOW': intensity = 0.3; break
      }

      return {
        position: [x, 0.8, z + 0.5],
        intensity,
        severity: vuln.severity,
        vulnInfo: vuln,
      }
    })
  }, [vulns])

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={() => onClick && onClick(version)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* House body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.6]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Black outline effect - slightly larger box */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.82, 0.82, 0.62]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.65, 0.5, 4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Roof outline */}
      <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.66, 0.51, 4]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.25, 0.31]}>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.06, 0.25, 0.33]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Face on front of house */}
      <HouseFace vulnCount={vulnCount} position={[0, 0.55, 0.31]} />

      {/* Fires */}
      {fires.map((fire, i) => (
        <Fire 
          key={i} 
          position={fire.position} 
          intensity={fire.intensity}
          severity={fire.severity}
          vulnInfo={fire.vulnInfo}
        />
      ))}

      {/* Version label */}
      <Text
        position={[0, -0.15, 0.5]}
        fontSize={0.12}
        color={isSelected ? '#fbbf24' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {version.length > 12 ? version.substring(0, 10) + '...' : version}
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
}

// Camera controller to handle scrolling
function CameraController({ targetX, versions }) {
  const { camera } = useThree()
  
  useFrame(() => {
    camera.position.x += (targetX - camera.position.x) * 0.05
  })

  return null
}

CameraController.propTypes = {
  targetX: PropTypes.number.isRequired,
  versions: PropTypes.array,
}

// Ground plane with grid
function Ground({ isMalicious }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 10]} />
      <meshStandardMaterial 
        color={isMalicious ? '#7f1d1d' : '#374151'} 
        roughness={0.8}
      />
    </mesh>
  )
}

Ground.propTypes = {
  isMalicious: PropTypes.bool,
}

// Background fires for malicious packages
function BackgroundFires() {
  const fires = useMemo(() => {
    const result = []
    for (let i = 0; i < 20; i++) {
      result.push({
        position: [
          (Math.random() - 0.5) * 40,
          0.1,
          -3 - Math.random() * 5,
        ],
        intensity: 0.3 + Math.random() * 0.5,
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

// Main scene component
function Scene({ auditData, selectedVersion, onHouseClick }) {
  const [scrollOffset, setScrollOffset] = useState(0)
  
  // Get versions to display
  const versions = useMemo(() => {
    if (!auditData?.versions || auditData.versions.length === 0) {
      // If no versions from API, create a single version entry
      return [selectedVersion || '1.0.0']
    }
    return auditData.versions
  }, [auditData, selectedVersion])

  // Find selected version index
  const selectedIndex = useMemo(() => {
    if (!selectedVersion) return versions.length - 1
    const idx = versions.indexOf(selectedVersion)
    return idx >= 0 ? idx : versions.length - 1
  }, [versions, selectedVersion])

  // Initial camera position based on selected version
  useEffect(() => {
    setScrollOffset(selectedIndex * 1.5)
  }, [selectedIndex])

  // Get vulnerabilities for a specific version
  const getVulnsForVersion = (version) => {
    if (!auditData?.vulnerabilities) return []
    return auditData.vulnerabilities.filter(vuln => {
      // Check if this version is in the affected versions
      if (vuln.affected_versions?.includes(version)) return true
      // Or check if version is between introduced and fixed
      if (vuln.introduced && vuln.fixed) {
        // Simple string comparison - not perfect but works for semver-like versions
        return version >= vuln.introduced && version < vuln.fixed
      }
      if (vuln.introduced && !vuln.fixed) {
        return version >= vuln.introduced
      }
      // Default: include all vulns if we can't determine
      return true
    })
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ff6b6b" />

      {/* Camera controller */}
      <CameraController targetX={scrollOffset} versions={versions} />

      {/* Ground */}
      <Ground isMalicious={auditData?.is_malicious} />

      {/* Background fires for malicious packages */}
      {auditData?.is_malicious && <BackgroundFires />}

      {/* Houses */}
      {versions.map((version, index) => {
        const vulns = getVulnsForVersion(version)
        return (
          <House
            key={version}
            position={[index * 1.5, 0, 0]}
            color={HOUSE_COLORS[index % HOUSE_COLORS.length]}
            version={version}
            vulns={vulns}
            onClick={onHouseClick}
            isSelected={version === selectedVersion}
          />
        )
      })}

      {/* Orbit controls for camera manipulation */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  )
}

Scene.propTypes = {
  auditData: PropTypes.object,
  selectedVersion: PropTypes.string,
  onHouseClick: PropTypes.func,
}

// Main exported component
function HouseScene({ auditData, selectedVersion, onHouseClick }) {
  const scrollContainerRef = useRef()
  const [scrollPosition, setScrollPosition] = useState(0)

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollLeft)
  }

  const versions = auditData?.versions || []
  const maxScroll = Math.max(0, (versions.length - 4) * 100)

  return (
    <div className={`relative w-full h-[500px] ${auditData?.is_malicious ? 'malicious-bg' : ''}`}>
      {/* Malicious package warning */}
      {auditData?.is_malicious && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl border-2 border-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-display text-lg">MALICIOUS PACKAGE DETECTED</p>
                <p className="font-body text-sm opacity-90">
                  {auditData.malicious_details?.summary || 'This package has been flagged as malicious'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2.5, 5], fov: 50 }}
        shadows
        className="cursor-pointer"
      >
        <Scene 
          auditData={auditData}
          selectedVersion={selectedVersion}
          onHouseClick={onHouseClick}
        />
      </Canvas>

      {/* Scroll indicator / navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4">
          <span className="text-white/70 text-sm font-body">
            {versions.length} versions • Scroll or drag to navigate
          </span>
        </div>
      </div>

      {/* Scroll bar for house navigation */}
      {versions.length > 5 && (
        <div 
          ref={scrollContainerRef}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-3/4 overflow-x-auto house-scroll"
          onScroll={handleScroll}
        >
          <div 
            className="h-2 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 rounded-full"
            style={{ width: `${versions.length * 50}px` }}
          />
        </div>
      )}
    </div>
  )
}

HouseScene.propTypes = {
  auditData: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  onHouseClick: PropTypes.func.isRequired,
}

export default HouseScene

