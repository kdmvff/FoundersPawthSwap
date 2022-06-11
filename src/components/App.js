import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'

class App extends Component {

state = {message: "Hello, World!"}

updateState = () => {
  if (this.state.message == "Hello, World!") {
    this.setState({message: "Goodbye, World!"})
  }
  else {
    this.setState({message: "Hello, World!"})
  }
  
}

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                <h1>{this.state.message}</h1>
                <br />
                <button onClick={this.updateState}>change state</button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
