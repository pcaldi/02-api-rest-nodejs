import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.uuid('session_id').after('id').index()
  })
}
// .after() indica onde está coluna ele deve ser posicionado na tabela,
// no caso depois do id. Nem todos os bancos de dados suportam esse comando.
// .index() cria automaticamente um índice nesse campo da tabela.
// Índice é uma forma de falarmos para o banco de dados que eu vou fazer muitas
// buscas nesse caso no 'session_id' dentro do WHERE.

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('session_id')
  })
}
