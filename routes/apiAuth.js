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
const client_1 = require("@prisma/client");
const errorhandler_1 = require("../errors/errorhandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const apiAuthRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
apiAuthRouter.use(express_1.default.json());
apiAuthRouter.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findFirst({
            where: {
                username: req.body.username
            }
        });
        if (req.body.username === (user === null || user === void 0 ? void 0 : user.username)) {
            let hash = crypto_1.default.createHash("SHA256").update(req.body.password).digest("hex");
            if (hash === (user === null || user === void 0 ? void 0 : user.password)) {
                let token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, String(process.env.ACCESS_TOKEN_KEY));
                res.json({ token: token });
            }
            else {
                next(new errorhandler_1.ErrorClass(401, "Virheellinen käyttäjätunnus tai salasana"));
            }
        }
        else {
            next(new errorhandler_1.ErrorClass(401, "Virheellinen käyttäjätunnus tai salasana"));
        }
    }
    catch (e) {
        console.log(e);
        next(new errorhandler_1.ErrorClass());
    }
}));
exports.default = apiAuthRouter;
