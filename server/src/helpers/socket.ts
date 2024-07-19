const socketClients: Record<string, string> = {
    // [socketId]: userId
};

function addSocketClient(socketId: string, userId: string) {
    socketClients[socketId] = userId;
}

function removeSocketClient(socketId: string) {
    if (socketClients[socketId]) {
        delete socketClients[socketId];
    }
}

function getSocketClientsByUserId(userId: string): string[] {
    return Object.keys(socketClients).filter((socketId) => socketClients[socketId] === userId);
}

export { socketClients, addSocketClient, removeSocketClient, getSocketClientsByUserId };
