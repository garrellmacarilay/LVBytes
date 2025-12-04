// Test updated server API endpoint
fetch('http://localhost:5174/api/ask-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, respond with just "Working!"' })
})
.then(async res => {
  console.log('Response status:', res.status);
  const text = await res.text();
  console.log('Response body:', text);
  try {
    const data = JSON.parse(text);
    console.log('✅ Server API:', data);
  } catch (e) {
    console.log('❌ JSON parse error:', e.message);
  }
})
.catch(err => console.error('❌ Fetch error:', err));