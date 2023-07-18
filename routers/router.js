const middlewareController = require("../controller/middleware");
const authControler = require("../controller/authController");
const userController = require("../controller/userController");

const router = require("express").Router();

router.post("/api/register", authControler.registerUser);
router.post("/api/login", authControler.login);

router.get(
    "/api/get-all-user",
    middlewareController.verifyToken,
    userController.getAllUsers
);
router.delete(
    "/api/detete-fake-user",
    middlewareController.verifyTokeAndAdmin,
    userController.deleteFakeUser
);

router.post("/api/refresh-token", authControler.refreshToken);

router.post(
    "/api/logout",
    middlewareController.verifyToken,
    authControler.logout
);

module.exports = router;
