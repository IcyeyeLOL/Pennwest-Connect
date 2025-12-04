// Test API route to verify backend connection
import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${apiUrl}/`)
    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      backend: apiUrl,
      message: data.message 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      backend: apiUrl,
      error: error.message 
    }, { status: 500 })
  }
}


