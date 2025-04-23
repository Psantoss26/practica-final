const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client.controller");
const auth = require("../middleware/auth.middleware");

router.use(auth);

router.post("/", clientController.createClient);
router.get("/", clientController.getClients);
router.get("/archived", clientController.getArchivedClients);
router.get("/:id", clientController.getClientById);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient); // soft delete
router.delete("/:id/hard", clientController.hardDeleteClient);
router.patch("/:id/restore", clientController.restoreClient);

module.exports = router;
