const router = require("express").Router();
const userCtrl = require("../controller/userController");
const auth = require("../../middleware/auth");

router.post("/user/register", userCtrl.register);

router.get("/refresh_token", userCtrl.refreshToken);

router.post("/user/login", userCtrl.login);

router.get("/user/logout", userCtrl.logout);

router.get("/user/verify-email", userCtrl.verifyUser);

router.get("/user/success", userCtrl.success);

router.get("/", userCtrl.getusers);

router.delete("/user/delete/:id", userCtrl.delete);

module.exports = router;
