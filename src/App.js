import React, { Component } from 'react'
import Viewer from './viewer'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="row">
          <Viewer src='assets/skull/scene.gltf' />
          <Viewer src='assets/skull/scene.gltf' />
        </div>        
      </div>
    )
  }
}

export default App
