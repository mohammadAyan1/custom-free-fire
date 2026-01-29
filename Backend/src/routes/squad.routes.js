import express from "express";
import {
    squadCreated,
    getSquadByCode,
    checkSquadStatus,
    uploadPayment,
    getSquadByUser,
} from "../controller/squard.controller.js";
import { uploadImage } from "../middleware/uploadImage.middleware.js";

const router = express.Router();

router.post(
    "/squad-register",
    uploadImage("squad").fields([
        { name: "screenshots", maxCount: 4 },
    ]),
    squadCreated
);

// New route for payment upload
router.post(
    "/upload-payment/:code",
    uploadImage("payment").single("payment"),
    uploadPayment
);

router.get("/by-code/:code", getSquadByCode);
router.get("/status/:code", checkSquadStatus);
router.get("/user/:code", getSquadByUser);

export default router;