const keys = require('./keys')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

/**
 * execute express
 */

const app = express()
app.use(cors())
app.use(bodyParser.json())

/**
 * Posgress connection
 */

const { Pool } = require('pg')
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
})
pgClient.on('error', () => console.error('Lost Pg connection'))

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch((err) => console.error(err))

/**
 * Redis Client Setup
 */
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()

/**
 * Express route handler
 */
app.get('/', (req, res) => {
    res.send('Hi')
}) 

app.get('/values/all', async(req, res) => {
    const values = await pgClient.query('SELECT * FROM values')
    res.send(values.rows)
})

// Builtin promise not avaliable
app.get('/values/current', async(req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values', async (req, res) => {
    const index = req.body.index
    if(parseInt(index) > 40) return status(422).send('Index too high')
    redisClient.hset('values', index, 'Nothing Yet!')
    redisPublisher.publish('insert', index)
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
    res.send({ working: true })
})

app.listen(5000, () => {
    console.log('listening on port 5000')
})