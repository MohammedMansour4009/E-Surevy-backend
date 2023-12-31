const supervisorServer = require('../../Controller/user/supervisorController')
const express = require("express");
const router = express.Router();

router.post("/login",supervisorServer.loginSupervisor)
router.post("/register",supervisorServer.registerSupervisor)
router.delete("/:id",supervisorServer.deleteSupervisor)
router.put("/:id",supervisorServer.supervisorUpdate)
router.get("/all",supervisorServer.allSupervisor)

module.exports = router


