import { NextResponse } from 'next/server'

const RETRY_DELAYS = [1000, 2500, 5000]; // ms between retries

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    
    const requestBody = JSON.stringify({
      model: body.model || 'claude-sonnet-4-5-20250929',
      max_tokens: body.max_tokens || 1000,
      system: body.system || '',
      messages: body.messages || [],
    })

    let lastError = null

    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: requestBody,
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json(data)
        }

        // Only retry on 429 (rate limit) and 529 (overloaded)
        if (response.status === 429 || response.status === 529) {
          lastError = `Anthropic API error: ${response.status}`
          if (attempt < RETRY_DELAYS.length) {
            await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]))
            continue
          }
        }

        // Non-retryable error
        const errText = await response.text()
        console.error('Anthropic API error:', response.status, errText)
        return NextResponse.json({ error: `Anthropic API error: ${response.status}` }, { status: response.status })

      } catch (fetchErr) {
        lastError = fetchErr.message
        if (attempt < RETRY_DELAYS.length) {
          await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]))
          continue
        }
      }
    }

    return NextResponse.json({ error: lastError || 'Max retries exceeded' }, { status: 529 })
  } catch (err) {
    console.error('Proxy error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
