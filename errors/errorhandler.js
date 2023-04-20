"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorClass = void 0;
class ErrorClass extends Error {
    constructor(status, viesti) {
        super();
        this.status = status || 500;
        this.viesti = viesti || "Unexpected error on server.";
    }
}
exports.ErrorClass = ErrorClass;
const errorhandler = (err, req, res, next) => {
    res.status(err.status).json({ virhe: err.viesti });
    next();
};
exports.default = errorhandler;
