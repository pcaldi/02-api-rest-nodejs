import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Cookies <-> Forma de manter contexto entre requisições.

// unitários: unidade da sua aplicação
// integração: comunicação entre duas ou mais unidades
// e2e: ponta a ponta: simula um usuário operando na nossa aplicação

// back-end: desde a rota até o banco de dados

// Pirâmide de testes: E2E (nào dependem de nenhuma tecnologia, não depende de arquitetura)

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')

    return { transactions }
  })

  // http://localhost:3333/transactions/uuid
  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { sessionId } = request.cookies
    const { id } = getTransactionParamsSchema.parse(request.params)

    // .first() no final indica que só quero buscar uma única transação com aquele id
    const transaction = await knex('transactions')
      .where({
        id,
        session_id: sessionId,
      })
      .first()

    return { transaction }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        // passando um segundo parâmetro para a função .sum() para renomear a coluna.
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // Estou validando os dados do meu request.body que são os dados da minha requisição,
    // para ver se eles batem com o schema que foi definido.
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      // quando cadastrar o valor do amount no débito ele será multiplicado por -1
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
