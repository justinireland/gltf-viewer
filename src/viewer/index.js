import React from 'react'
import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'
import './viewer.css'

const Viewer = () => {
  const { useRef, useEffect, useState } = React
  const mount = useRef(null)
  const [isAnimating, setAnimating] = useState(true)
  const controls = useRef(null)
  const sources = [
    'assets/skull/scene.gltf',
    'assets/adamHead/adamHead.gltf',
    'assets/the_noble_craftsman/scene.gltf'
  ]
  const activeSource = 0
    
  useEffect(() => {
    let width = mount.current.clientWidth
    let height = mount.current.clientHeight
    let frameId
    
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.z = 4
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setClearColor('#000000')
    renderer.setSize(width, height)
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2
    
    // Lights
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 )
    hemiLight.position.set( 0, 500, 0 )
    scene.add(hemiLight)

    let dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set( -1, 0.75, 1 )
    dirLight.position.multiplyScalar( 50)
    dirLight.name = "dirlight"
    // dirLight.shadowCameraVisible = true

    dirLight.castShadow = true
    dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024*2

    const d = 300
    dirLight.shadowCameraLeft = -d
    dirLight.shadowCameraRight = d
    dirLight.shadowCameraTop = d
    dirLight.shadowCameraBottom = -d

    dirLight.shadowCameraFar = 3500
    dirLight.shadowBias = -0.0001
    dirLight.shadowDarkness = 0.35

    scene.add(dirLight)

    // Loader
    const loader = new GLTFLoader()
    loader.load(sources[activeSource], 
      // onLoad
      gltf => scene.add(gltf.scene),
      // onProgress
      xhr => {},
      // onError
      err => console.error('Error loading glTF asset', err)
    )
        
    const renderScene = () => {
      renderer.render(scene, camera)
    }

    const handleResize = () => {
      width = mount.current.clientWidth
      height = mount.current.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderScene()
    }
    
    const animate = () => {
      renderScene()
      frameId = window.requestAnimationFrame(animate)
    }

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate)
      }
    }

    const stop = () => {
      cancelAnimationFrame(frameId)
      frameId = null
    }

    mount.current.appendChild(renderer.domElement)
    window.addEventListener('resize', handleResize)
    start()

    controls.current = { start, stop }
    
    return () => {
      stop()
      window.removeEventListener('resize', handleResize)
      mount.current.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (isAnimating) {
      controls.current.start()
    } else {
      controls.current.stop()
    }
  }, [isAnimating])
  
  return <div className="viewer" ref={mount} onClick={() => setAnimating(!isAnimating)} />
}

export default Viewer