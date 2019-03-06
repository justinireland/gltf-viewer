import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'
import './viewer.css'

class Viewer extends Component {
  constructor(props){
    super(props)
        
    this.scene = new THREE.Scene()
    this.mount = React.createRef()
    this.loader = new GLTFLoader()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.camera = new THREE.PerspectiveCamera(55, 0.5, 0.1, 1000)

    this.state = {
      width: null,
      height: null
    }
  }

  async componentDidMount() {     
            
    this.setupCamera()
    this.setupLights()
    await this.loadSource()            
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

  loadSource = () => {
    return new Promise((resolve, reject) => {
      this.loader.load(this.props.src, 
        // onLoad
        gltf => {
          this.scene.add(gltf.scene)
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

  setupRenderer = () => {
    this.renderer.setClearColor('#000000')
    this.renderer.setSize(this.state.width, this.state.height)
    this.renderer.gammaOutput = true
    this.renderer.gammaFactor = 2.2    
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
    return (
      <div className="viewer" ref={this.mount} />
    )
  }    
}

Viewer.propTypes = {
  src: PropTypes.string.isRequired
}

export default Viewer