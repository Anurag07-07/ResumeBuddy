import mongoose, { Document, Schema } from "mongoose";

export enum Severity {
  low = "low",
  medium = "medium",
  high = "high"
}

export interface ITechnicalQuestion {
  question: string;
  intention: string;
  answer: string;
}

export interface IBehaviouralQuestion {
  question: string;
  intention: string;
  answer: string;
}

export interface ISkill {
  skill: string;
  severity: Severity;
}

export interface IPreparation {
  day: number;
  focus: Severity;
  tasks: string;
}

export interface IInterview extends Document {
  jobDescription: string;
  resume?: string;
  selfDescription?: string;
  matchScore?: number;
  technicalQuestion: ITechnicalQuestion[];
  behaviouralQuestion: IBehaviouralQuestion[];
  skillGap: ISkill[];
  preparationPlan: IPreparation[];
  user:mongoose.Types.ObjectId
}


const technicalQuestionSchema = new Schema<ITechnicalQuestion>(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true }
  },
  { _id: false }
);

const behaviouralQuestionSchema = new Schema<IBehaviouralQuestion>(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true }
  },
  { _id: false }
);

const skillSchema = new Schema<ISkill>(
  {
    skill: { type: String, required: true },
    severity: {
      type: String,
      enum: Object.values(Severity),
      required: true
    }
  },
  { _id: false }
);

const preparationSchema = new Schema<IPreparation>(
  {
    day: { type: Number, required: true },
    focus: {
      type: String,
      enum: Object.values(Severity),
      required: true
    },
    tasks: { type: String, required: true }
  },
  { _id: false }
);

const interviewSchema = new Schema<IInterview>(
  {
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
    preparationPlan: [preparationSchema],
    user:{
      type:mongoose.Types.ObjectId,
      ref:"Users"
    }
  },
  { timestamps: true }
);


export default mongoose.model<IInterview>("Interview", interviewSchema);