const mongoose = require("mongoose")
const connection = mongoose.connect("mongodb://0.0.0.0/Complete-Project").then(()=>{
    console.log("Database Connected")
})
module.exports = connection