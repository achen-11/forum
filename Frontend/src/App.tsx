import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <img src={reactLogo} alt="React logo" className="w-24 h-24 animate-spin-slow" />
        </div>
        
        <h1 className="text-4xl font-bold">Vite + React</h1>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">Click on the Vite and React logos to learn more</p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              count is {count}
            </button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Edit <code className="bg-muted px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App
