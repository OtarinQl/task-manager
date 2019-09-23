const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
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