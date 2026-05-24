import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
    },
    role: {
      type: String,
      required: [true, "Message role is required"],
      enum: ["user", "ai"],
      index: true,
    },
    attachment: {
      name: { type: String },
      mimeType: { type: String },
      data: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
