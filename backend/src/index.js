require('dotenv').config()
const createKnexClient = require('./knex-client')
const createExpressApp = require('./app/express')
const createOrderComponent = require('./components/order')
const createStrategyComponent = require('./components/strategy')
const createMonitorComponent = require('./components/monitor')
const createPostgresClient = require('./postgres-client') 
const createMessageStore = require('./message-store') 
const createStraddleApp = require('./app/atmStraddle')
const createTradePage = require('./aggregators/trades-page')
const createTradesApp = require('./app/trades')

const knexClient = createKnexClient({
  connectionString: "postgres://postgres@localhost:5432/practical_microservices"
})

const db = createPostgresClient({ 
  connectionString: "postgres://postgres@localhost:5433/message_store"
})
const messageStore = createMessageStore({db})
const strategyComponent = createStrategyComponent({messageStore})
strategyComponent.start()
const orderComponent = createOrderComponent({messageStore})
orderComponent.start()
const monitorComponent = createMonitorComponent({messageStore})
monitorComponent.start()
const tradePage = createTradePage({db:knexClient, messageStore})
tradePage.start()

const straddleApp = createStraddleApp({messageStore})
const tradesApp = createTradesApp({db:knexClient})

function createConfig() {
  return {
    db,
    messageStore,
    strategyComponent,
    orderComponent,
    monitorComponent,
    straddleApp,
    tradesApp
  }
}
const config = createConfig()
const app = createExpressApp(config)

const port = process.env.PORT
app.listen(port, () => console.log(`server listening on port ${port}`))