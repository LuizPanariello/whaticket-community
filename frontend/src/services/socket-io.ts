import { io } from "socket.io-client";
import { getBackendUrl } from "../config";

function connectToSocket() {
    return io(getBackendUrl());
}

export default connectToSocket;