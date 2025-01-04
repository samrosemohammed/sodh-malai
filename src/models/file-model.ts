import mongoose, { Schema, Model } from "mongoose";

enum UploadStatus {
  Pending = "PENDING",
  InProgress = "PROCESSING",
  Completed = "COMPLETED",
  Failed = "FAILED",
}

interface IFile {
  name: string;
  uploadStatus: UploadStatus;
  url: string;
  key: string;
  user: mongoose.Types.ObjectId;
}

export interface MongoUser extends IFile, Document {}

export type TFile = IFile & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const FileSchema = new Schema<MongoUser>(
  {
    name: { type: String, required: true },
    uploadStatus: {
      type: String,
      enum: Object.values(UploadStatus),
      required: true,
      default: UploadStatus.Pending,
    },
    url: { type: String, required: true },
    key: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FileModel: Model<MongoUser> =
  mongoose.models.File || mongoose.model<MongoUser>("File", FileSchema);
export default FileModel;
