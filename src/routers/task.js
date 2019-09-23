const express = require('express')

const Task = require('../models/task')
const middleware = require('../main/functions')

const router = express.Router()

router.post('/tasks/create', middleware.auth, async(req, res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/tasks/show', middleware.auth, async(req, res)=>{
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    } else {
        match.completed = false
    }

    if(req.query.sortBy){
        const ver = req.query.sortBy.split(':')
        sort[ver[0]] = ver[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: 5,
                skip: parseInt(req.query.skip)
            },
            sort
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', middleware.auth, async(req, res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send('No se ha encontrado su tarea!')
        }

        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', middleware.auth, async(req, res)=>{
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if(!task){
            return res.status(404).send('No se ha hallado ninguna tarea suya.')
        }

        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', middleware.auth, async(req, res)=>{
    try {
        const body = req.body
        const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { body })
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', middleware.auth, async(req, res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send('No se ha encontrado ninguna tarea')
        }
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router