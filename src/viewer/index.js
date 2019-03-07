import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'
import PointerLockControls from 'three-pointer-lock-controls'
import './viewer.css'

class Viewer extends Component {
  constructor(props){
    super(props)
        
    this.scene = new THREE.Scene()
    this.mount = React.createRef()
    this.loader = new GLTFLoader()
    this.model = null
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    this.camera = new THREE.PerspectiveCamera(55, 0.5, 0.1, 1000)    
    this.controls = new PointerLockControls(this.camera)

    this.state = {
      width: null,
      height: null
    }
  }

  async componentDidMount() {     
    this.setupScene()
    this.setupCamera()
    this.setupLights()
    await this.setupLoader()            
    await this.updateDims()
    this.updateCamera()
    this.setupRenderer()
    this.renderScene()
                    
    this.mount.current.appendChild(this.renderer.domElement)
    window.addEventListener('resize', this.handleResize) 
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.mount.current.removeChild(this.renderer.domElement)
  }

  handleResize = async () => {
    await this.updateDims()
    this.updateRenderer()
    this.updateCamera()        
    this.renderScene()
  }
  
  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  setupCamera = () => {    
    this.camera.aspect = this.state.width / this.state.height
    this.camera.position.z = 4
  }
  
  setupLights = () => {    
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 )
    hemiLight.position.set( 0, 500, 0 )
    this.scene.add(hemiLight)

    let dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set( -1, 0.75, 1 )
    dirLight.position.multiplyScalar( 50)
    dirLight.name = "dirlight"
    
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 1024*2

    const d = 300
    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d

    dirLight.shadow.camera.far = 3500
    dirLight.shadow.bias = -0.0001
    
    this.scene.add(dirLight)
  }

  setupLoader = () => {
    return new Promise((resolve, reject) => {
      this.loader.load(this.props.src,

        // onLoad
        gltf => {
          this.model = gltf.scene

          this.scene.add(this.model)

          gltf.scene.traverse(object => {
            if(object.isMesh) object.castShadow = true
          })

          resolve()

        },

        // onProgress
        xhr => {},

        // onError
        err => {
          console.error('Error loading glTF asset', err)
          reject()
        }
      )
    })     
  }

  setupModel = () => {
    const skeletonHelper = new THREE.SkeletonHelper(this.model)
    this.scene.add(skeletonHelper)    
  }

  setupRenderer = () => {    
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setSize(this.state.width, this.state.height)
    this.renderer.gammaOutput = true
    this.renderer.gammaFactor = 2.2    
  }

  setupScene = () => {
    //this.scene.background = new THREE.Color(this.props.color)
  }

  updateCamera = () => {
    this.camera.aspect = this.state.width / this.state.height
    this.camera.updateProjectionMatrix()
  }

  updateDims = () => {
    let width = this.mount.current.offsetWidth
    let height = this.mount.current.offsetHeight 
    
    return new Promise((resolve) => {
      this.setState({ width, height }, () => resolve())
    }) 
  }

  updateRenderer = () => {        
    this.renderer.setSize(this.state.width, this.state.height)
  }

  render() {
    const viewerStyle = {      
      backgroundColor: this.props.color || 'black'      
    }
    
    return (
      <div className='viewer' style={viewerStyle} ref={this.mount} />
    )
  }    
}

Viewer.propTypes = {
  color: PropTypes.string,
  src: PropTypes.string.isRequired
}

export default Viewer