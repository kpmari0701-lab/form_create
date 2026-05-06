import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function FormBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [title, setTitle] = useState('New Form')
  const [formImage, setFormImage] = useState('')
  const [whatsappFooterText, setWhatsappFooterText] = useState('Your application is submitted... \nwaiting for few days....\n\nஆவணங்களை பதிவேற்றவும்....\n1,Photo,புகைப்படம்\n2,ஆதார் கார்டு\n3,ரேஷன் கார்டு\n4,sign& கையொப்பம்\n\npayment : 60₹ only💰\nநன்றி!')
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    if (id) {
      fetch(`http://${window.location.hostname}:3001/api/forms/${id}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title)
          setQuestions(data.questions)
          if (data.formImage) setFormImage(data.formImage)
          if (data.whatsappFooterText !== undefined) {
            setWhatsappFooterText(data.whatsappFooterText)
          }
        })
        .catch(err => console.error(err))
    }
  }, [id])

  const addQuestion = (type) => {
    const newQ = {
      id: `q_${Date.now()}`,
      label: `Question ${questions.length + 1}`,
      type,
      required: true
    }

    if (type === 'repeater') {
      newQ.fields = [
        { label: 'பெயர் (தமிழில்)', type: 'text' },
        { label: 'Name (English)', type: 'text' },
        { label: 'உறவுமுறை', type: 'dropdown', options: ['Self', 'தந்தை', 'தாய்', 'சகோதரி', 'அக்கா', 'தம்பி', 'அண்ணன்', 'மனைவி', 'மகன்', 'மகள்'] },
        { label: 'வயது', type: 'number' },
        { label: 'தொழில்', type: 'text' },
        { label: 'வருமானம்', type: 'text' }
      ]
    }

    setQuestions([...questions, newQ])
  }

  const updateQuestion = (id, key, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [key]: value } : q))
  }

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const moveQuestionUp = (index) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
    setQuestions(newQuestions);
  }

  const moveQuestionDown = (index) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index + 1], newQuestions[index]] = [newQuestions[index], newQuestions[index + 1]];
    setQuestions(newQuestions);
  }

  const saveForm = async () => {
    try {
      const url = id ? `http://${window.location.hostname}:3001/api/forms/${id}` : `http://${window.location.hostname}:3001/api/forms`
      const method = id ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, formImage, whatsappFooterText, questions })
      })
      if (res.ok) {
        navigate('/admin')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save form')
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Form Builder</h1>
      </header>
      
      <label>Form Title</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} />

      <label>Form Header Image (Optional)</label>
      {formImage && <img src={formImage} alt="Header" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', marginBottom: '10px' }} />}
      <input 
        type="file" 
        accept="image/*" 
        onChange={e => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setFormImage(reader.result)
            reader.readAsDataURL(file)
          } else {
            setFormImage('')
          }
        }} 
      />

      <label>WhatsApp Extra Content (Appended at the end of submission)</label>
      <textarea 
        rows="5" 
        value={whatsappFooterText} 
        onChange={e => setWhatsappFooterText(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', marginBottom: '20px' }}
      />

      <h3>Questions</h3>
      {questions.map((q, index) => (
        <div key={q.id} className="section" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
            <button type="button" className="btn-secondary" style={{ padding: '4px 10px', margin: 0, minHeight: 'auto', width: 'auto', fontSize: '14px' }} onClick={() => moveQuestionUp(index)} disabled={index === 0}>↑</button>
            <button type="button" className="btn-secondary" style={{ padding: '4px 10px', margin: 0, minHeight: 'auto', width: 'auto', fontSize: '14px' }} onClick={() => moveQuestionDown(index)} disabled={index === questions.length - 1}>↓</button>
            <button type="button" className="remove-btn" style={{ position: 'static', margin: 0, minHeight: 'auto', width: 'auto', padding: '4px 10px', fontSize: '14px' }} onClick={() => removeQuestion(q.id)}>X</button>
          </div>
          <label>Question Label</label>
          <input 
            type="text" 
            value={q.label} 
            onChange={e => updateQuestion(q.id, 'label', e.target.value)} 
          />
          <p>Type: <strong>{q.type}</strong></p>
          
          {q.type !== 'repeater' && (
            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', color: '#1f2933' }}>
                <input 
                  type="checkbox" 
                  checked={q.required} 
                  onChange={e => updateQuestion(q.id, 'required', e.target.checked)} 
                  style={{ width: 'auto', margin: 0 }}
                />
                Is this field required?
              </label>
            </div>
          )}

          {q.type === 'dropdown' && (
            <div>
              <label>Options (comma separated)</label>
              <input 
                type="text" 
                value={(q.options || []).join(',')} 
                onChange={e => updateQuestion(q.id, 'options', e.target.value.split(','))} 
              />
            </div>
          )}
        </div>
      ))}

      <div className="buttons" style={{ marginTop: '20px' }}>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('text')}>+ Text</button>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('textarea')}>+ Text Area</button>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('number')}>+ Number</button>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('date')}>+ Date</button>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('dropdown')}>+ Dropdown</button>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('file')}>+ Image Upload</button>
        <button type="button" className="btn-secondary" onClick={() => addQuestion('repeater')}>+ Repeater (Family)</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button onClick={saveForm}>Save Form</button>
        <button className="btn-secondary" style={{ marginTop: '10px' }} onClick={() => navigate('/admin')}>Cancel</button>
      </div>
    </div>
  )
}
