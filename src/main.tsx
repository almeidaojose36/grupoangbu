import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import SmoothScroll from './components/SmoothScroll'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <SmoothScroll>
                <App />
            </SmoothScroll>
        </BrowserRouter>
    </React.StrictMode>,
)
