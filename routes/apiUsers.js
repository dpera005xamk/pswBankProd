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
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const apiUsersRouter = express_1.default.Router();
apiUsersRouter.use(express_1.default.json());
/*
apiUsersRouter.delete("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    if (await prisma.user.count({
        where: {
            id: req.params.id
        }
    })) {
        try {

            await prisma.user.delete({
                where: {
                    id: req.params.id
                }
            });

            res.json(await prisma.user.findMany());

        } catch (e: any) {
            next(new ErrorClass())
        }
    } else {
        next(new ErrorClass(400, "Virheellinen id"));
    }

});
*/
apiUsersRouter.put("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userData = jsonwebtoken_1.default.verify(req.body.token, String(process.env.ACCESS_TOKEN_KEY));
    let user = undefined;
    if (typeof userData === 'string') {
        // it can not be string
        next(new errorhandler_1.ErrorClass(400, "Virheellinen pyynnön body"));
    }
    else {
        user = yield prisma.user.findFirst({
            where: {
                id: userData.id
            }
        });
        // check that old password matches
        let hash = crypto_1.default.createHash("SHA256").update(req.body.oldPassword).digest("hex");
        if (hash === (user === null || user === void 0 ? void 0 : user.password)) {
            // old password is ok, lets change it to new:
            try {
                yield prisma.user.update({
                    where: {
                        id: userData.id
                    },
                    data: Object.assign(Object.assign({}, user), { password: crypto_1.default.createHash("SHA256").update(req.body.newPassword).digest("hex") })
                });
                res.status(200).json({ "message: ": "changed" });
            }
            catch (e) {
                next(new errorhandler_1.ErrorClass());
            }
        }
        else {
            console.log('different password');
            next(new errorhandler_1.ErrorClass(401, "Virheellinen käyttäjätunnus tai salasana"));
        }
        console.log('user: ', user);
    }
    // change password to new
    // respond, that ok.
    /*
        if (await prisma.user.count({
            where: {
                id: Number(req.params.id)
            }
        })) {
    
            if (req.body.id &&
                req.body.username &&
                req.body.password) {
    
                const foundPerson: any = await prisma.user.count({
                    where: {
                        id: Number(req.params.id)
                    }
                });
    
                try {
    
                    await prisma.user.update({
                        where: {
                            id: Number(req.params.id)
                        },
                        data: {
                            ...foundPerson,
                            username: req.body.username,
                            password: req.body.password
                        }
                    });
    
                    res.json(await prisma.user.findMany());
    
                } catch (e: any) {
                    next(new ErrorClass())
                }
    
            } else {
                next(new ErrorClass(400, "Virheellinen pyynnön body"));
            }
        } else {
            next(new ErrorClass(400, "Virheellinen id"));
        }
    */
}));
apiUsersRouter.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.username &&
        req.body.password) {
        try {
            const allUsers = yield prisma.user.findMany();
            const existingUser = allUsers.filter(useri => req.body.username === useri.username);
            if (existingUser.length === 1) {
                console.log('in use');
                return res.status(400).json({
                    message: "Käyttäjätunnus on jo käytössä.",
                });
            }
            yield prisma.user.create({
                data: {
                    id: crypto_1.default.randomUUID(),
                    username: req.body.username,
                    password: crypto_1.default.createHash("SHA256").update(req.body.password).digest("hex"),
                    admin: false
                }
            });
            return res.status(200).json({ message: "käyttäjätunnus luotu!" });
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
apiUsersRouter.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        if (await prisma.user.count({
            where: {
                id: Number(req.params.id)
            }
        }) === 1) {
            res.json(await prisma.user.findUnique({
                where: {
                    id: Number(req.params.id)
                }
            }))
        } else {
            next(new ErrorClass(400, "Virheellinen id"));
        }

    } catch (e: any) {
        next(new ErrorClass());
    }


});
*/
apiUsersRouter.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(yield prisma.user.findMany());
    }
    catch (e) {
        next(new errorhandler_1.ErrorClass());
    }
}));
exports.default = apiUsersRouter;
