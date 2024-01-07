const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const surveyorSchema = new Schema({
    surveyorName: String,
    password:String,
    phone:String,
    companyName:String
},{ timestamps: true });
// Create a model based on that schema
const Surveyor = mongoose.model("surveyor", surveyorSchema);

module.exports = Surveyor

