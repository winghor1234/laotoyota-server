
import CryptoJS from "crypto-js"
import { SECREAT_KEY, SECREAT_KEY_REFRESH } from "../config/globalKey.js"
import { EMessage } from "./message.js"
import jwt from "jsonwebtoken";
import prisma from "../config/prima.js";
import { empty } from "@prisma/client/runtime/library.js";
export const EncryptData = async (data) => { // ເຂົ້າລະຫັດ
    return CryptoJS.AES.encrypt(data, SECREAT_KEY).toString()
}
export const DecryptData = async (data) => { // ຖອດລະຫັດ
    const decode = CryptoJS.AES.decrypt(data, SECREAT_KEY).toString(CryptoJS.enc.Utf8);
    return decode
}

export const CheckPhoneNumber = async (phoneNumber) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.user.findFirst({ where: { phoneNumber: parseInt(phoneNumber) } });
            if (data) {
                return reject("phoneNumber is already");
            }
            return resolve(true)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindByPhoneNumber = async (phoneNumber) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.user.findFirst({ where: { phoneNumber: parseInt(phoneNumber) } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneEmployee = async (employee_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.employee.findFirst({ where: { employee_id: employee_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindEmployeeByUser = async (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.employee.findFirst({ where: { userId: user_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneByUser = async (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.user.findFirst({ where: { user_id: user_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneUser = async (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.user.findFirst({ where: { user_id: user_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneBranch = async (branch_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.branch.findFirst({ where: { branch_id: branch_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneService = async (service_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.service.findFirst({ where: { service_id: service_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneCar = async (car_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.car.findFirst({ where: { car_id: car_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneTime = async (timeId) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.time.findFirst({ where: { time_id: timeId } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}

export const FindOneBooking = async (bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.booking.findFirst({ where: { booking_id: bookingId } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneZone = async (zoneId) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.zone.findFirst({ where: { zone_id: zoneId } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneGiftCard = async (giftcard_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.giftCard.findFirst({ where: { giftcard_id: giftcard_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneGiftHistory = async (gifthistory_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.giftHistory.findFirst({ where: { gifthistory_id: gifthistory_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}

export const VerifyRefreshToken = async (refreshToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(refreshToken, SECREAT_KEY_REFRESH, async (err, decode) => {
                if (err) return reject(err);

                const data = await prisma.user.findFirst({ where: { user_id: decode.id } });
                if (!data) return reject(EMessage.NotFound);
                return resolve(data);
            })
        } catch (error) {
            return reject(error)
        }
    })
}

export const VerifyToken = async (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(token, SECREAT_KEY, async (err, decode) => {
                if (err) return reject(err);

                const data = await prisma.user.findFirst({ where: { user_id: decode.id } });
                if (!data) return reject(EMessage.NotFound);
                return resolve(data);
            })
        } catch (error) {
            return reject(error)
        }
    })
}
export const GenerateToken = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const payload = {
                id: data
            }
            const payload_refresh = {
                id: payload.id
            }
            const token = jwt.sign(payload, SECREAT_KEY, { expiresIn: "1h" });
            const refreshToken = jwt.sign(payload_refresh, SECREAT_KEY_REFRESH, { expiresIn: "3h" });
            return resolve({ token, refreshToken });
        } catch (error) {
            return reject(error);
        }
    })
}