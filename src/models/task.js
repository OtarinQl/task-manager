const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify:false
})

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        
    },
    desc:{
        type: String,
        trim: true,
        default: 'Sin descripción disponible.'
    },
    completed:{
        type: Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

const Task = mongoose.model('Task', taskSchema)

module.exports = Task