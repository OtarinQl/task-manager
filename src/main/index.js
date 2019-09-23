const express = require('express')

const userRouter = require('../routers/user')
const taskRouter = require('../routers/task')

const app = express()
const port =  process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('Conectado en el puerto ' + port)
})

/*
/home/otarin/mongodb/bin/mongod --dbpath=/home/otarin/mongodb-data
*/