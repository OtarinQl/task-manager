const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next)=>{
    try {
        const decoded = jwt.verify(req.headers.bearer,process.env.JWTSECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': req.headers.bearer })
        
        if(!user){
            throw new Error('No se ha encontrado el usuario!')
        }

        req.token = req.headers.bearer
        req.user = user
        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({error: 'Se necesita autenticar.'})
    }
}

module.exports = {
    auth
}