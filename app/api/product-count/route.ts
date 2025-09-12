import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'product-counts.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read product counts from file
function readProductCounts(): Record<string, number> {
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading product counts:', error)
  }
  return {}
}

// Write product counts to file
function writeProductCounts(counts: Record<string, number>) {
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(counts, null, 2))
  } catch (error) {
    console.error('Error writing product counts:', error)
  }
}

// GET: Retrieve count for a specific product
export async function GET(request: NextRequest) {
  try {
    const productName = request.nextUrl.searchParams.get('productName')
    
    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const counts = readProductCounts()
    const count = counts[productName.toLowerCase()] || 0

    return NextResponse.json({ productName, count })
  } catch (error) {
    console.error('Error in GET /api/product-count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Increment count for a specific product
export async function POST(request: NextRequest) {
  try {
    const { productName } = await request.json()
    
    if (!productName || typeof productName !== 'string' || productName.trim() === '') {
      return NextResponse.json({ error: 'Valid product name is required' }, { status: 400 })
    }

    const normalizedName = productName.toLowerCase().trim()
    const counts = readProductCounts()
    
    counts[normalizedName] = (counts[normalizedName] || 0) + 1
    writeProductCounts(counts)

    return NextResponse.json({ 
      productName: productName.trim(), 
      count: counts[normalizedName] 
    })
  } catch (error) {
    console.error('Error in POST /api/product-count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 