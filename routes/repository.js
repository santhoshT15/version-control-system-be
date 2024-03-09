const express = require("express");
const { addRepo, viewAllRepo, viewOneRepo, updateRepo, deleteRepo } = require("../controllers/repository");

const router = express.Router();

router.post("/add", addRepo);

router.get("/view", viewAllRepo);

router.get("/:repoId", viewOneRepo);

router.put("/update/:repoId", updateRepo);

router.delete("/delete/:repoId", deleteRepo);

module.exports = router;