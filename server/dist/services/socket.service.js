"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = exports.socketClients = void 0;
exports.addSocketClient = addSocketClient;
exports.removeSocketClient = removeSocketClient;
exports.getSocketClientsByUserId = getSocketClientsByUserId;
exports.addOnlineUser = addOnlineUser;
exports.socketClients = {
// [socketId]: userId
};
function addSocketClient(socketId, userId) {
    exports.socketClients[socketId] = userId;
}
function removeSocketClient(socketId) {
    if (exports.socketClients[socketId]) {
        delete exports.socketClients[socketId];
    }
}
function getSocketClientsByUserId(userId) {
    return Object.keys(exports.socketClients).filter((socketId) => exports.socketClients[socketId] === userId);
}
exports.onlineUsers = {
// [userId]: OnlineUser
};
function addOnlineUser(userId, userInfo) {
    if (!exports.onlineUsers[userId]) {
        exports.onlineUsers[userId] = userInfo;
    }
}
//# sourceMappingURL=socket.service.js.map