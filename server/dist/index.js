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
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const error_handler_middleware_1 = require("./middlewares/error-handler.middleware");
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const routes_1 = __importDefault(require("./routes"));
const sockets_1 = __importDefault(require("./sockets"));
const passport_1 = __importDefault(require("passport"));
const google_service_1 = require("./services/google.service");
dotenv_1.default.config();
// Config server
const app = (0, express_1.default)();
const httpServer = (0, node_http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_BASE_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});
// Use middlewares
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.ENVIRONMENT === "production", sameSite: "none", maxAge: 30 * 60 * 1000 }, // 30 minutes},
}));
app.set("io", io);
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ credentials: true, origin: process.env.CLIENT_BASE_URL }));
app.options("*", (0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.disable("etag");
// Routes
app.use(routes_1.default);
// Passport middleware
(0, google_service_1.initializeLoginWithGoogleService)();
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(error_handler_middleware_1.errorHandler);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const uri = process.env.MONGODB_URI;
    try {
        yield mongoose_1.default.connect(uri);
        console.log(`Database connected`);
        // Set up Socket.io event handlers
        (0, sockets_1.default)(io);
        httpServer.listen(PORT, () => {
            console.log(`running on https://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.log("error: ", error.message);
        process.exit(1);
    }
});
startServer();
//# sourceMappingURL=index.js.map