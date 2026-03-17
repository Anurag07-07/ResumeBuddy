import mongoose, { Document } from "mongoose";
export declare enum Severity {
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
    user: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<IInterview, {}, {}, {}, mongoose.Document<unknown, {}, IInterview, {}, mongoose.DefaultSchemaOptions> & IInterview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInterview>;
export default _default;
//# sourceMappingURL=interviewReport.schema.d.ts.map