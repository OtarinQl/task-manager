const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const middleware = require('../main/functions')
const accountMsg = require('../emails/account')

const router = express.Router()

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('No es un archivo .jpg!'))
        }
        cb(null, true)
    }
})


router.get('/users/me/avatar', middleware.auth, upload.single('avatar'), async(req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send(req.user)
}, (error, req, res, next)=>{
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async(req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw new Error('No se ha encontrado perfil imagen de perfil')
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

router.delete('/users/me/avatar', middleware.auth, upload.single('avatar'), async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send(req.user)
}, (error, req, res, next)=>{
    res.status(404).send({ error: error.message })
})

router.get('/users/all', async(req, res)=>{
    try {
        const user = await User.find()
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', middleware.auth, async(req, res)=>{
    try {
        const user = await User.findById({ _id: req.user._id })
        const data = await user.getPublicData()
        res.send(data)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.post('/users/signup', async (req, res)=>{
    const user = new User(req.body)
    try {
        await user.generateAuthToken()
        accountMsg.welcomeEmail(user.email, user.name)
        res.send('Registro completo!\nSu Token: ' + user.tokens.toString()´)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.post('/users/login', async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(404).send(e)
    }
})

router.post('/users/logout', middleware.auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token !== req.token
        })
        req.user.save()
        res.send('Se ha desconectado satisfactoriamente!')
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', middleware.auth, async (req, res)=>{
    try {
        req.user.tokens = []
        req.user.save()
        res.send(req.user)
    } catch (e) {
        req.status(500).send(e)
    }
})

router.delete('/users/me', middleware.auth, async(req, res)=>{
    try {
        await req.user.remove()
        accountMsg.goodbyeEmail(req.user.email, req.user.name)
        res.send('Se ha eliminado satisfactoriamente el usuario!')
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router
