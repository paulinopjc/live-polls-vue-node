import { describe, it, expect } from '@jest/globals'
import request from 'supertest'
import { createApp } from '../src/app'

const app = createApp()

describe('POST /api/polls', () => {
  it('creates a poll with valid input', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Lunch?', options: ['Pizza', 'Sushi'] })

    expect(res.status).toBe(201)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.question).toBe('Lunch?')
    expect(res.body.data.options).toHaveLength(2)
  })

  it('rejects fewer than 2 options', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Q?', options: ['Solo'] })
    expect(res.status).toBe(422)
    expect(res.body.details.options).toContain('At least 2 options required')
  })

  it('rejects more than 6 options', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({
        question: 'Too many?',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      })
    expect(res.status).toBe(422)
  })

  it('rejects duplicate options', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Q?', options: ['Pizza', 'Pizza'] })
    expect(res.status).toBe(422)
    expect(res.body.details.options).toContain('unique')
  })

  it('rejects empty question', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: '', options: ['a', 'b'] })
    expect(res.status).toBe(422)
  })
})

describe('GET /api/polls/:id', () => {
  it('returns a poll with empty totals', async () => {
    const create = await request(app)
      .post('/api/polls')
      .send({ question: 'Q?', options: ['A', 'B'] })
    const id = create.body.data.id

    const res = await request(app).get(`/api/polls/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.poll.id).toBe(id)
    expect(res.body.data.total_votes).toBe(0)
    expect(Object.keys(res.body.data.totals)).toHaveLength(2)
  })

  it('returns 404 for missing poll', async () => {
    const res = await request(app).get('/api/polls/does-not-exist')
    expect(res.status).toBe(404)
  })
})