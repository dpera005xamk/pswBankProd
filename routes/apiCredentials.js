"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorhandler_1 = require("../errors/errorhandler");
const client_1 = require("@prisma/client");
// setup of encrypting
const crypto = require("crypto");
const algorithm = process.env.ALGORITHM;
const initVector = process.env.INITVECTOR;
const securityKey = process.env.SECRETCRYPTKEY;
const fetchAndDecrypt = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    let creds = yield prisma.credentials.findMany({
        where: {
            userId: userId
        }
    });
    const mapped = creds.map(cred => {
        const decipher1 = crypto.createDecipheriv(algorithm, securityKey, initVector);
        const decipher2 = crypto.createDecipheriv(algorithm, securityKey, initVector);
        const decipher3 = crypto.createDecipheriv(algorithm, securityKey, initVector);
        let page = decipher1.update(cred.page, "hex", "utf-8");
        page += decipher1.final("utf8");
        let username = decipher2.update(cred.username, "hex", "utf-8");
        username += decipher2.final("utf8");
        let password = decipher3.update(cred.password, "hex", "utf-8");
        password += decipher3.final("utf8");
        return Object.assign(Object.assign({}, cred), { page: page, username: username, password: password });
    });
    return mapped;
});
const encryptData = (page, username, password) => __awaiter(void 0, void 0, void 0, function* () {
    // encrypts the new entry with these
    const cipher1 = crypto.createCipheriv(algorithm, securityKey, initVector);
    const cipher2 = crypto.createCipheriv(algorithm, securityKey, initVector);
    const cipher3 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let encryptedPage = cipher1.update(page, "utf-8", "hex");
    let encryptedUsername = cipher2.update(username, "utf-8", "hex");
    let encryptedPassword = cipher3.update(password, "utf-8", "hex");
    encryptedPage += cipher1.final("hex");
    encryptedUsername += cipher2.final("hex");
    encryptedPassword += cipher3.final("hex");
    return { page: encryptedPage, username: encryptedUsername, password: encryptedPassword };
});
const prisma = new client_1.PrismaClient();
const apiCredentialsRouter = express_1.default.Router();
apiCredentialsRouter.use(express_1.default.json());
apiCredentialsRouter.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield prisma.credentials.count({
        where: {
            id: Number(req.params.id)
        }
    })) {
        try {
            yield prisma.credentials.delete({
                where: {
                    id: Number(req.params.id)
                }
            });
            const mapped = yield fetchAndDecrypt(res.locals.user.id);
            res.json(mapped);
        }
        catch (e) {
            next(new errorhandler_1.ErrorClass());
        }
    }
    else {
        next(new errorhandler_1.ErrorClass(400, "Virheellinen id"));
    }
}));
apiCredentialsRouter.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (yield prisma.credentials.count({
        where: {
            id: Number(req.params.id)
        }
    })) {
        if ((((_a = req.body) === null || _a === void 0 ? void 0 : _a.page.length) > 0 &&
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.username.length) > 0 &&
            ((_c = req.body) === null || _c === void 0 ? void 0 : _c.password.length) > 0)) {
            // encrypts the new entry with these
            const encryptValues = yield encryptData(req.body.page, req.body.username, req.body.password);
            try {
                yield prisma.credentials.update({
                    where: {
                        id: Number(req.params.id)
                    },
                    data: {
                        page: encryptValues.page,
                        username: encryptValues.username,
                        password: encryptValues.password,
                        userId: res.locals.user.id
                    }
                });
                const mapped = yield fetchAndDecrypt(res.locals.user.id);
                res.json(mapped);
            }
            catch (e) {
                next(new errorhandler_1.ErrorClass());
            }
        }
        else {
            next(new errorhandler_1.ErrorClass(400, "Virheellinen pyynnön body"));
        }
    }
    else {
        next(new errorhandler_1.ErrorClass(400, "Virheellinen id"));
    }
}));
apiCredentialsRouter.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    if (((_d = req.body) === null || _d === void 0 ? void 0 : _d.page.length) > 0 &&
        ((_e = req.body) === null || _e === void 0 ? void 0 : _e.username.length) > 0 &&
        ((_f = req.body) === null || _f === void 0 ? void 0 : _f.password.length) > 0) {
        // encrypts the new entry with these
        // encrypts the new entry with these
        const encryptValues = yield encryptData(req.body.page, req.body.username, req.body.password);
        try {
            yield prisma.credentials.create({
                data: {
                    page: encryptValues.page,
                    username: encryptValues.username,
                    password: encryptValues.password,
                    userId: res.locals.user.id
                }
            });
            // this fetches from database and decrypts
            const mapped = yield fetchAndDecrypt(res.locals.user.id);
            res.json(mapped);
        }
        catch (e) {
            console.log(e);
            next(new errorhandler_1.ErrorClass());
        }
    }
    else {
        next(new errorhandler_1.ErrorClass(400, "Virheellinen pyynnön body"));
    }
}));
/*
apiCredentialsRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     try {

        if (await prisma.credentials.count({
            where : {
                id : Number(req.params.id)
            }
        }) === 1) {
            res.json(await prisma.credentials.findUnique({
                where : {
                    id : Number(req.params.id)
                }
            }))
        } else {
            next(new ErrorClass(400, "ErrorClasselinen id"));
        }
        
    } catch (e: any) {
        next(new ErrorClass());
    }
    

});
*/
apiCredentialsRouter.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mapped = yield fetchAndDecrypt(res.locals.user.id);
        res.json(mapped);
    }
    catch (e) {
        next(new errorhandler_1.ErrorClass());
    }
}));
exports.default = apiCredentialsRouter;
