import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function FormRenderer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [repeaterCounts, setRepeaterCounts] = useState({})
  
  useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/api/forms/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => setForm(data))
      .catch(err => {
        console.error(err)
        navigate(-1)
      })
  }, [id, navigate])

  const handleAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  const handleRepeaterChange = (qId, index, fieldLabel, val) => {
    setAnswers(prev => {
      const currentArr = prev[qId] || []
      const newArr = [...currentArr]
      if (!newArr[index]) newArr[index] = {}
      newArr[index][fieldLabel] = val
      return { ...prev, [qId]: newArr }
    })
  }

  const sendToWhatsApp = (e) => {
    e.preventDefault()
    if (!form) return

    let msg = `*${form.title}*\n\n`

    form.questions.forEach(q => {
      if (q.type !== 'repeater') {
        const val = answers[q.id] || '';
        if (val.toString().trim() !== '') {
          msg += `${q.label} : ${val}\n`
        }
      } else {
        msg += `\n*${q.label}*\n`
        const count = repeaterCounts[q.id] || 0
        const repeaterAnswers = answers[q.id] || []
        
        for (let i = 0; i < count; i++) {
          msg += `\nMember ${i + 1}:\n`
          q.fields.forEach(f => {
            const val = (repeaterAnswers[i] && repeaterAnswers[i][f.label]) || ''
            if (val.toString().trim() !== '') {
              msg += `${f.label}: ${val}\n`
            }
          })
        }
      }
    })

    if (form.whatsappFooterText) {
      msg += `\n\n${form.whatsappFooterText}`
    }

    const encodedMsg = encodeURIComponent(msg)
    window.open(`https://wa.me/919385497906?text=${encodedMsg}`, '_blank')
  }

  if (!form) return <p>Loading...</p>

  return (
    <div className="container">
      <header>
        {form.formImage && (
          <img 
            src={form.formImage.startsWith('/assets/') ? `http://${window.location.hostname}:3001${form.formImage}` : form.formImage} 
            alt="Header" 
            style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto 15px auto', borderRadius: '8px' }} 
          />
        )}
        <h1>{form.title}</h1>
      </header>
      
      <form onSubmit={sendToWhatsApp}>
        {form.questions.map(q => {
          if (q.type === 'repeater') {
            const count = repeaterCounts[q.id] || 0
            return (
              <div key={q.id} style={{ marginTop: '20px' }}>
                <h2>{q.label}</h2>
                <label>எத்தனை உறுப்பினர்கள்?</label>
                <input 
                  type="number" 
                  min="0" 
                  value={count} 
                  onChange={e => setRepeaterCounts({ ...repeaterCounts, [q.id]: parseInt(e.target.value) || 0 })} 
                />
                
                {Array.from({ length: count }).map((_, index) => (
                  <div key={index} className="section">
                    <h3>Member {index + 1}</h3>
                    {q.fields.map(f => (
                      <div key={f.label}>
                        <label>{f.label}</label>
                        {f.type === 'dropdown' ? (
                          <select 
                            required
                            onChange={e => handleRepeaterChange(q.id, index, f.label, e.target.value)}
                          >
                            <option hidden>Select {f.label}</option>
                            {f.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            type={f.type} 
                            required
                            onChange={e => handleRepeaterChange(q.id, index, f.label, e.target.value)} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div key={q.id}>
              <label>
                {q.label}
                {q.required && <span style={{ color: '#c92a2a', marginLeft: '4px' }}>*</span>}
              </label>
              {q.type === 'dropdown' ? (
                <select required onChange={e => handleAnswer(q.id, e.target.value)}>
                  <option hidden>Select {q.label}</option>
                  {(q.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : q.type === 'file' ? (
                <input 
                  type="file" 
                  accept="image/*"
                  required={q.required} 
                  onChange={e => handleAnswer(q.id, e.target.files[0] ? e.target.files[0].name : '')} 
                />
              ) : q.type === 'textarea' ? (
                <textarea 
                  required={q.required} 
                  rows="4"
                  onChange={e => handleAnswer(q.id, e.target.value)} 
                />
              ) : (
                <input 
                  type={q.type} 
                  required={q.required} 
                  onChange={e => handleAnswer(q.id, e.target.value)} 
                />
              )}
            </div>
          )
        })}

        <div className="buttons" style={{ marginTop: '30px' }}>
          <button type="submit">Send application to WhatsApp</button>
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
        </div>
      </form>
    </div>
  )
}
