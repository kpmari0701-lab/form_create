import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import FormBuilder from './FormBuilder'
import FormRenderer from './FormRenderer'

function LandingPage() {
  const navigate = useNavigate()

  const handleAdminLogin = () => {
    const password = prompt('Please enter Admin Password (hint: admin123):')
    if (password === 'admin123') {
      navigate('/admin')
    } else if (password !== null) {
      alert('Incorrect Password!')
    }
  }

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <header>
        <h1>Welcome to Form Portal</h1>
      </header>
      <h2>Select Your Role</h2>
      <div className="buttons" style={{ flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        <button onClick={() => navigate('/user')} style={{ padding: '15px', fontSize: '18px' }}>I am a User (Fill out forms)</button>
        <button onClick={handleAdminLogin} className="btn-secondary" style={{ padding: '15px', fontSize: '18px' }}>I am an Admin (Manage forms)</button>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [forms, setForms] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = () => {
    fetch(`http://${window.location.hostname}:3001/api/forms`)
      .then(res => res.json())
      .then(data => setForms(data))
      .catch(err => console.error(err))
  }

  const deleteForm = (id) => {
    if (confirm('Are you sure you want to delete this form?')) {
      fetch(`http://${window.location.hostname}:3001/api/forms/${id}`, { method: 'DELETE' })
        .then(() => fetchForms())
        .catch(err => console.error(err))
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Admin Dashboard</h1>
      </header>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/admin/builder">
          <button style={{ width: 'auto' }}>Create New Form</button>
        </Link>
        <button className="btn-secondary" style={{ width: 'auto' }} onClick={() => navigate('/')}>Logout</button>
      </div>
      <h2>Manage Forms</h2>
      <ul className="form-list">
        {forms.map(form => (
          <li key={form.id}>
            <span>{form.title}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/form/${form.id}`}><button style={{width: 'auto', padding: '5px 10px'}}>View</button></Link>
              <Link to={`/admin/builder/${form.id}`}><button style={{width: 'auto', padding: '5px 10px', background: '#0056b3'}}>Edit</button></Link>
              <button style={{width: 'auto', padding: '5px 10px', background: 'red'}} onClick={() => deleteForm(form.id)}>Delete</button>
            </div>
          </li>
        ))}
        {forms.length === 0 && <p>No forms created yet.</p>}
      </ul>
    </div>
  )
}

function UserDashboard() {
  const [forms, setForms] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/forms.json')
      .then(res => res.json())
      .then(data => setForms(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="container">
      <header>
        <h1>Available Forms</h1>
      </header>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn-secondary" style={{ width: 'auto' }} onClick={() => navigate('/')}>Back to Home</button>
      </div>
      <h2>Please select a form to fill out:</h2>
      <ul className="form-list">
        {forms.map(form => (
          <li key={form.id}>
            <span>{form.title}</span>
            <Link to={`/form/${form.id}`}><button style={{width: 'auto', padding: '5px 10px'}}>Fill Form</button></Link>
          </li>
        ))}
        {forms.length === 0 && <p>No forms available at the moment.</p>}
      </ul>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin/builder" element={<FormBuilder />} />
        <Route path="/admin/builder/:id" element={<FormBuilder />} />
        <Route path="/form/:id" element={<FormRenderer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
