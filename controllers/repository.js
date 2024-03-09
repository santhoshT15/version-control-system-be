const Repos = require("../models/repository");

const addRepo = async (req, res) => {
  try {
    const { userId } = req;
    const { repoName, content, comment } = req.body;

    const payload = {
      user: userId,
      repoName: repoName,
      version: [
        {
          content: content,
          comment: comment,
        },
      ],
    };

    const existingRepo = await Repos.findOne({ user: userId, repoName: repoName });

    if (existingRepo) {
      return res.status(409).send({ message: "A repository already exists with the same name. Please try with a different name" });
    }

    let newRepo = new Repos(payload);

    const data = await newRepo.save();
    res.status(201).send({ message: "Repository created successfully", data: data._id });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const viewAllRepo = async (req, res) => {
  try {
    const { userId } = req;
    const repos = await Repos.find({ user: userId });

    if (repos) {
      return res.status(200).send({ repos: repos });
    }
    res.status(404).send({ message: "No repository exist" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

const viewOneRepo = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    const repo = await Repos.findById(repoId);

    if (repo) {
      return res.status(200).send({ repo: repo });
    }
    res.status(404).send({ message: "No such repository exist" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

const updateRepo = async (req, res) => {
  try {
    const { content, comment } = req.body;
    const repoId = req.params.repoId;

    const existingRepo = await Repos.findById(repoId);
    if (existingRepo) {
      const payload = {
        content: content,
        comment: comment,
      };

      Repos.findByIdAndUpdate(repoId, { $push: { version: payload } }, (err, data) => {
          if (err) { 
            return res.status(400).send({ message: "Error while committing the changes", error: err.message });
          }
          console.log(data)
        }
      );
      return res.status(200).send({ message: "Committed changes" });
    }
    res.status(404).send({ message: "No such repository exist" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

const deleteRepo = async (req, res) => {
  try {
    const repoId = req.params.repoId;

    const existingRepo = await Repos.findById(repoId);
    if (existingRepo) {
      Repos.findByIdAndDelete(repoId, (err, data) => {
        if (err) {
          return res.status(400).send({ message: "Error while deleting the repository", error: err });
        }
      });
      return res.status(200).send({ message: "Repository deleted successfully" });
    }
    res.status(404).send({ message: "No such repository exist" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

module.exports = { addRepo, viewAllRepo, viewOneRepo, updateRepo, deleteRepo };