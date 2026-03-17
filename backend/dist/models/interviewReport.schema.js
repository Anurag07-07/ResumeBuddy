import mongoose, { Document, Schema } from "mongoose";
export var Severity;
(function (Severity) {
    Severity["low"] = "low";
    Severity["medium"] = "medium";
    Severity["high"] = "high";
})(Severity || (Severity = {}));
const technicalQuestionSchema = new Schema({
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true }
}, { _id: false });
const behaviouralQuestionSchema = new Schema({
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true }
}, { _id: false });
const skillSchema = new Schema({
    skill: { type: String, required: true },
    severity: {
        type: String,
        enum: Object.values(Severity),
        required: true
    }
}, { _id: false });
const preparationSchema = new Schema({
    day: { type: Number, required: true },
    focus: {
        type: String,
        enum: Object.values(Severity),
        required: true
    },
    tasks: { type: String, required: true }
}, { _id: false });
const interviewSchema = new Schema({
    jobDescription: { type: String, required: true },
    resume: { type: String },
    selfDescription: { type: String },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestion: [technicalQuestionSchema],
    behaviouralQuestion: [behaviouralQuestionSchema],
    skillGap: [skillSchema],
    preparationPlan: [preparationSchema]
}, { timestamps: true });
export default mongoose.model("Interview", interviewSchema);
//# sourceMappingURL=interviewReport.schema.js.map