import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CompanyPage from './pages/CompanyPage'
import { companies } from './data/site'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                {companies.map((c) => (
                    <Route key={c.slug} path={`empresa/${c.slug}`} element={<CompanyPage key={c.slug} company={c} />} />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}

export default App
