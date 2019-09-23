const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Task = require('./task')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify:false
})

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('El correo electrónico no es válido!')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value==='password'){
                throw new Error('Contraseña inválida! Pruebe con otra palabra distinta de \'password\'.')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Valor de edad incorrecta! Debe ser un entero.')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
}, { timestamps: true })
/*
La relación como tal se estable definiendo un 'virtual', donde
se podrá acceder de forma sencilla a los datos de la otra 
colección. Para esto, referenciamos la colección que queremos
utilizar (ref), el atributo local (localField) y el atributo
de la otra coleción (foreignField) relacionados. 
*/
UserSchema.virtual('tasks', { 
    ref:'Task',
    localField:'_id',
    foreignField:'owner' })

UserSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

UserSchema.pre('remove', async function(next){
    await Task.deleteMany({ owner: this._id })
    next()
})

UserSchema.methods.getPublicData = async function(){
    return { name: this.name, email: this.email, age: this.age }
}

UserSchema.methods.generateAuthToken = async function(){
    token = jwt.sign( { _id: this._id.toString() }, process.env.JWTSECRET )
    this.tokens = this.tokens.concat({ token })

    await this.save()
}

UserSchema.statics.findByCredentials = async function(email, password){
    const user = await User.findOne({ email })
    if(!user){ throw new Error('No se ha encontrado ninguna cuenta con ese correo...') }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch){ throw new Error('Contraseña incorrecta!') }
    
    return user
}

const User = mongoose.model('User', UserSchema)

module.exports = User
