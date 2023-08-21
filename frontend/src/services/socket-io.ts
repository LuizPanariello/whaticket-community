import { io } from "socket.io-client";
import { getBackendUrl } from "../config";

function connectToSocket() {
    console.log("Connection: ", getBackendUrl())
    return io(getBackendUrl());
}

export default connectToSocket;