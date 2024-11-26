import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_KV_REST_API_URL || process.env.KV_REST_API_URL!,
  token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const boardId = searchParams.get('id')
  
  if (!boardId) {
    return Response.json({ error: 'Board ID is required' }, { status: 400 })
  }

  try {
    const board = await redis.get(`board:${boardId}`)
    return Response.json(board)
  } catch (error) {
    console.error('Error loading board:', error)
    return Response.json({ error: 'Failed to load board' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { boardId, squares } = await request.json()
    
    await redis.set(`board:${boardId}`, {
      squares,
      createdAt: new Date().toISOString()
    }, {
      ex: 60 * 60 * 24 * 7 // Expire after 7 days
    })
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error saving board:', error)
    return Response.json({ error: 'Failed to save board' }, { status: 500 })
  }
} 