"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const apiCredentials_1 = __importDefault(require("./routes/apiCredentials"));
const apiAuth_1 = __importDefault(require("./routes/apiAuth"));
const apiUsers_1 = __importDefault(require("./routes/apiUsers"));
const errorhandler_1 = __importDefault(require("./errors/errorhandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const portti = Number(process.env.PORT);
const checkToken = (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        res.locals.user = jsonwebtoken_1.default.verify(token, String(process.env.ACCESS_TOKEN_KEY));
        next();
    }
    catch (e) {
        console.log(e);
        res.status(401).json({});
    }
};
app.use(express_1.default.static(path_1.default.resolve(__dirname, "public")));
app.use("/api/auth", apiAuth_1.default);
app.use("/api/credentials", checkToken, apiCredentials_1.default);
app.use("/api/users", apiUsers_1.default);
app.use(errorhandler_1.default);
app.use((req, res, next) => {
    if (!res.headersSent) {
        res.status(404).json({ viesti: "invalid route" });
    }
    next();
});
app.listen(portti, () => {
    console.log(`Server online on port : ${portti}`);
});
