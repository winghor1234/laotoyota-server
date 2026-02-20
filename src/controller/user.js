
import { EMessage, Role, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { CheckPhoneNumber, DecryptData, EncryptData, FindByPhoneNumber, GenerateToken, VerifyRefreshToken, FindOneUser } from "../service/service.js";
import prisma from "../config/prima.js";
import { UploadImageToCloud } from "../config/cloudinary.js";

export default class UserController {
    static async SearchUser(req, res) {
        try {
            const search = req.query.search;

            const data = await prisma.user.findMany({
                where: {
                    phoneNumber: { contains: search }, username: {
                        contains: search
                    }
                }
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Search, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async getAllUser(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
            } = req.query;
            const query = {};
            if (search)
                query['OR'] = getSearchQuery(
                    ['phoneNumber', 'username'],
                    search
                );
            const user = await prisma.user.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            if (!user) return SendError(res, 404, EMessage.NotFound);
            return {
                total: await prisma.user.count({ where: query }),
                page,
                limit,
                data: user
            }
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.user.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const user_id = req.params.user_id;

            const data = await prisma.user.findFirst({ where: { user_id: user_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Login(req, res) {
        try {
            const { phoneNumber, password, deviceToken } = req.body;
            const validate = await ValidateData({ phoneNumber, password });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","));
            }
            const user = await FindByPhoneNumber(phoneNumber); // ສ້າງໃນ service
            if (!user) return SendError(res, 404, EMessage.NotFound);
            const decryptPassword = await DecryptData(user.password);
            if (decryptPassword !== password) {
                return SendError(res, 404, EMessage.NotMatch);
            }
            if (deviceToken) {
                await prisma.user.update({
                    data: {
                        deviceToken
                    },
                    where: {
                        user_id: user.user_id,
                    }
                })
            }
            const token = await GenerateToken(user.user_id); // ສ້າງໃນ service
            const data = Object.assign(
                JSON.parse(JSON.stringify(user)),
                JSON.parse(JSON.stringify(token)),
            );
            data.password = undefined;
            data.role = undefined;
            return SendSuccess(res, SMessage.Login, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async LoginAdmin(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            const validate = await ValidateData({ phoneNumber, password });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const user = await FindByPhoneNumber(phoneNumber); // ສ້າງໃນ service
            if (!user) return SendError(res, 404, EMessage.NotFound);

            if (user.role === Role.general) {
                return SendError(res, 400, EMessage.BadRequest);
            }
            const decryptPassword = await DecryptData(user.password);
            if (decryptPassword !== password) {
                return SendError(res, 404, EMessage.NotMatch);
            }
            const token = await GenerateToken(user.user_id); // ສ້າງໃນ service
            const data = Object.assign(
                JSON.parse(JSON.stringify(user)),
                JSON.parse(JSON.stringify(token)),
            );
            data.password = undefined;
            return SendSuccess(res, SMessage.Login, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Register(req, res) {
        try {
            const { username, phoneNumber, password, province, district, village, email } = req.body;
            // console.log(req.body);
            const validate = await ValidateData({
                username, phoneNumber,
                password, province, district, village
            });

            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','))
            }
            const checkPhoneNumber = await CheckPhoneNumber(phoneNumber); // ສ້າງຢູ່ service
            if (!checkPhoneNumber) return SendError(res, 404, EMessage.NotFound)
            const generatePassword = await EncryptData(password)
            const randow = "LTS" + `${Math.floor(Math.random() * (100 - 1 + 1)) + 1}`;
            const data = await prisma.user.create({
                data: {
                    username,
                    phoneNumber: parseInt(phoneNumber),
                    password: generatePassword,
                    province,
                    district,
                    village,
                    customer_number: randow.toString(),
                    role: Role.general,
                    point: 0,
                    email: email ?? null
                }
            })
            data.password = undefined;
            data.role = undefined;
            return SendCreate(res, SMessage.Register, data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async RegisterAdmin(req, res) {
        try {
            const { username, phoneNumber, password, province, district, village, email } = req.body;
            // console.log(req.body);
            const validate = await ValidateData({
                username, phoneNumber,
                password, province, district, village
            });

            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','))
            }
            const checkPhoneNumber = await CheckPhoneNumber(phoneNumber); // ສ້າງຢູ່ service
            if (!checkPhoneNumber) return SendError(res, 404, EMessage.NotFound)
            const generatePassword = await EncryptData(password)
            const randow = "LTS" + `${Math.floor(Math.random() * (100 - 1 + 1)) + 1}`;
            const data = await prisma.user.create({
                data: {
                    username,
                    phoneNumber: parseInt(phoneNumber),
                    password: generatePassword,
                    province,
                    district,
                    village,
                    customer_number: randow.toString(),
                    role: Role.admin,
                    point: 0,
                    email: email ?? null
                }
            })
            data.password = undefined;
            data.role = undefined;
            return SendCreate(res, SMessage.Register, data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async Forgot(req, res) {
        try {

            const { phoneNumber, newPassword } = req.body;
            const validate = await ValidateData({ phoneNumber, newPassword });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const user = await FindByPhoneNumber(phoneNumber);
            if (!user) return SendError(res, 404, EMessage.NotFound);
            const generatePassword = await EncryptData(newPassword);
            const data = await prisma.user.update({
                data: {
                    password: generatePassword,
                },
                where: {
                    user_id: user.user_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ChangePassword(req, res) {
        try {
            const user_id = req.user; // ມາຈາກ token 

            const { oldPassword, newPassword } = req.body;
            const validate = await ValidateData({ oldPassword, newPassword });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const user = await FindOneUser(user_id); // ສ້າງຢູ່ Serivce
            const decrypt = await DecryptData(user.password)
            if (oldPassword !== decrypt) {
                return SendError(res, 400, EMessage.NotMatch)
            }
            const generatePassword = await EncryptData(newPassword);
            const data = await prisma.user.update({
                data: {
                    password: generatePassword,
                },
                where: {
                    user_id: user_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateUser(req, res) {
        try {
            const user_id = req.user; // ມາຈາກ token 
            // console.log(req.body);
            const { username, email, province, district, village, removeImage } = req.body;
            const validate = await ValidateData({ username, province, district, village });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            let img_url = null;
            // check ຖ້າມີໄຟຣ
            if (req.files && req.files.image) {
                const image = req.files.image;
                img_url = await UploadImageToCloud(image.data, image.mimetype);
                if (!img_url) {
                    return SendError(res, 404, EMessage.EUpload);
                }
            }
            await FindOneUser(user_id); // ສ້າງຢູ່ Serivce
            const data = await prisma.user.update({
                data: {
                    username,
                    email,
                    province,
                    district,
                    village,
                    ...(img_url && { profile: img_url }), // ຖ້າມີຮຼບຄ່ອຍອັບໂຫຼດໄຟຣ
                    ...(removeImage && { profile: null }), // ຖ້າລົບຮູບ
                },
                where: {
                    user_id: user_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async DeleteUser(req, res) {
        try {
            const user_id = req.user; // ມາຈາກ token 
            await FindOneUser(user_id); // ສ້າງຢູ່ Serivce
            const data = await prisma.user.delete({ where: { user_id: user_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async Refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            // console.log(refreshToken);
            if (!refreshToken) {
                return SendError(res, 400, EMessage.BadRequest, "refreshToken")
            }
            const verify = await VerifyRefreshToken(refreshToken); // ສ້າງຢູ່ serivce 
            if (!verify) return SendError(res, 404, EMessage.NotFound);
            const token = await GenerateToken(verify.user_id); // ສ້າງໃນ service
            const data = Object.assign(
                JSON.parse(JSON.stringify(verify)),
                JSON.parse(JSON.stringify(token)),
            );
            data.password = undefined;
            data.role = undefined;
            return SendSuccess(res, SMessage.Update, token)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    // add new 
    static async GetProfile(req, res) {
        try {
            const user_id = req.user; // ມາຈາກ token
            const user = await FindOneUser(user_id);
            if (!user) return SendError(res, 404, EMessage.NotFound);
            user.password = undefined;
            // user.role = undefined;
            return SendSuccess(res, SMessage.Get, user);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async UpdateCustomer(req, res) {
        try {
            const user_id = req.params.customer_id;
            const { username, phoneNumber, province, district, village, email } = req.body;
            // console.log(req.body);
            const validate = await ValidateData({ username, phoneNumber, province, district, village, });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            await FindOneUser(user_id); // ສ້າງຢູ່ Serivce
            const data = await prisma.user.update({
                data: {
                    username, phoneNumber: parseInt(phoneNumber), province, district, village, email: email || null,
                },
                where: {
                    user_id: user_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }


    static async DeleteCustomer(req, res) {
        try {
            const user_id = req.params.customer_id;
            await FindOneUser(user_id); // ສ້າງຢູ່ Serivce
            const data = await prisma.user.delete({ where: { user_id: user_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }


    static async UpdatePoint(req, res) {
        try {
            const { user_id, point } = req.body;
            console.log(req.body);
            const validate = await ValidateData({ user_id, point });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            await FindOneUser(user_id); // ສ້າງຢູ່ Serivce
            const data = await prisma.user.update({
                data: {
                    point: { increment: parseInt(point) }
                },
                where: {
                    user_id: user_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }

    }

}