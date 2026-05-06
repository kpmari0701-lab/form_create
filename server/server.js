const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const formsFile = path.join(__dirname, 'forms.json');
const assetsDir = path.join(__dirname, 'assets');

// Ensure forms.json exists
if (!fs.existsSync(formsFile)) {
  fs.writeFileSync(formsFile, JSON.stringify([]));
}

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

app.use('/assets', express.static(assetsDir));

const processImage = (base64Image) => {
  if (base64Image && base64Image.startsWith('data:image')) {
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const type = matches[1];
      const data = Buffer.from(matches[2], 'base64');
      let ext = type.split('/')[1] || 'png';
      if (ext === 'jpeg') ext = 'jpg';
      const filename = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(assetsDir, filename);
      fs.writeFileSync(filePath, data);
      return `/assets/${filename}`;
    }
  }
  return base64Image;
};

// Get all forms
app.get('/api/forms', (req, res) => {
  try {
    const data = fs.readFileSync(formsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read forms data' });
  }
});

// Get specific form
app.get('/api/forms/:id', (req, res) => {
  try {
    const data = fs.readFileSync(formsFile, 'utf8');
    const forms = JSON.parse(data);
    const form = forms.find(f => f.id === req.params.id);
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read form data' });
  }
});

// Create new form
app.post('/api/forms', (req, res) => {
  try {
    const processedBody = { ...req.body };
    if (processedBody.formImage) {
      processedBody.formImage = processImage(processedBody.formImage);
    }
    
    const newForm = {
      id: crypto.randomUUID(),
      ...processedBody
    };
    
    const data = fs.readFileSync(formsFile, 'utf8');
    const forms = JSON.parse(data);
    forms.push(newForm);
    
    fs.writeFileSync(formsFile, JSON.stringify(forms, null, 2));
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

// Update an existing form
app.put('/api/forms/:id', (req, res) => {
  try {
    const data = fs.readFileSync(formsFile, 'utf8');
    let forms = JSON.parse(data);
    const index = forms.findIndex(f => f.id === req.params.id);
    
    if (index !== -1) {
      const processedBody = { ...req.body };
      if (processedBody.formImage) {
        processedBody.formImage = processImage(processedBody.formImage);
      }
      forms[index] = { ...forms[index], ...processedBody, id: req.params.id };
      fs.writeFileSync(formsFile, JSON.stringify(forms, null, 2));
      res.json(forms[index]);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update form data' });
  }
});

// Delete a form
app.delete('/api/forms/:id', (req, res) => {
  try {
    const data = fs.readFileSync(formsFile, 'utf8');
    let forms = JSON.parse(data);
    const newForms = forms.filter(f => f.id !== req.params.id);
    
    if (forms.length !== newForms.length) {
      fs.writeFileSync(formsFile, JSON.stringify(newForms, null, 2));
      res.json({ message: 'Form deleted successfully' });
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete form data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
