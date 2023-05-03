import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    /* 
      -timestamp  defaultTo do mysql 'NOW()',
      -timestamp defaultTo do sqlite/postgreSQL 'CURRENT_TIMESTAMP',
      -Como iremos utilizar o knex em qualquer banco de dados no futuro,
      e não ter que trocar o código passamos a variável, knex.fn.now()
    */
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions')
}
