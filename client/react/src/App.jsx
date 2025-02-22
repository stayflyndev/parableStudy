import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ParableList from './component/parables'
import LoadingScreen from "./component/Loading/Loading"; // Import animation

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <div>
 
      {loading ? <LoadingScreen onFinish={() => setLoading(false)} /> : <ParableList />}

      </div>
      
    </>
  )
}

export default App
