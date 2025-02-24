const mongoose = require("mongoose")
const taskschema = mongoose.Schema({
    title:String,
    content:String
})
const taskmodel = mongoose.model("task",taskschema)
module.exports = taskmodel