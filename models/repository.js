const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const repoSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    version: [
      {
        type: new Schema(
          {
            content: {
              type: String,
              required: true,
            },
            comment: {
              type: String,
              required: true,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repositories", repoSchema);