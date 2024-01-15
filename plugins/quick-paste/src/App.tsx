import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <button onClick={() => setCount((count) => count + 1)}>Click me</button>
      <p>Count: {count}</p>
    </div>
  )
}

export default App
