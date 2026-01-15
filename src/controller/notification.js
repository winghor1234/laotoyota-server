import firebaseAdmin from "../config/firebaseAdmin.js";
import { SendError, SendSuccess } from "../service/response.js"
import { EMessage, SMessage } from "../service/message.js"
import { ValidateData } from "../service/validate.js";
export default class NotificationController {
    static async sendDataOne(req, res) {
        try {
            const { deviceToken1, deviceToken2, title, body } = req.body;
            const validate = await ValidateData({ deviceToken1, deviceToken2, title, body });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const message = {
                tokens: [deviceToken1, deviceToken2],
                notification: {
                    title: title,
                    body: body,
                },
            };
            const msgSend = await firebaseAdmin.messaging().sendEachForMulticast(message);
            return SendSuccess(res, SMessage.SendDataOne, msgSend)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async sendDataMany(req, res) {
        try {
            const { deviceToken1, title, body } = req.body;
            const validate = await ValidateData({ deviceToken1, title, body });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const message = {
                tokens: [deviceToken1],
                notification: {
                    title: title,
                    body: body,
                },
            };
            const msgSend = await firebaseAdmin.messaging().sendEachForMulticast(message)

            return SendSuccess(res, SMessage.SendDataOne, msgSend)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}