import React, { Component } from 'react'
import Viewer from './viewer'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="row">
          <Viewer color='#FFFFFF' src='assets/skull/scene.gltf' />
          <Viewer color='#000000' src='assets/blanko/blanko.glb' />
        </div>        
      </div>
    )
  }
}

export default App
