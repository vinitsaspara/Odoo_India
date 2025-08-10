import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='flex items-center justify-center h-[100vh]'>
          <h1 className='text-6xl text-amber-500 font-serif' >Welcom Prompt Masters</h1>
      </div>
    </>
  )
}

export default App
