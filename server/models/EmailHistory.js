const mongoose = require("mongoose");

const emailHistorySchema = new mongoose.Schema({
    user: {     
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    Prompt: {
        type: String,
        required: true,     
    },
    generatedEmail: {
        type: String,
        default: "",
    },
subject: {
        type: String,
        required: true,     
    },
    emailBody: {
        type: String,
        required: true,     
    },
    linkedInDM: {
        type: String,
        required: true,
    },
    followUpEmail: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
},{timestamps: true});

const EmailHistory = mongoose.model("EmailHistory", emailHistorySchema);
module.exports = EmailHistory;
