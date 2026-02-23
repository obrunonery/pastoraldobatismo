import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    return host.includes(":");
}

function isSecureRequest(req: Request) {
    // Usando cast para any para contornar discrepâncias de tipos do express no ambiente TS
    const request = req as any;
    if (request.protocol === "https") return true;

    const forwardedProto = request.headers?.["x-forwarded-proto"];
    if (!forwardedProto) return false;

    const protoList = Array.isArray(forwardedProto)
        ? forwardedProto
        : forwardedProto.split(",");

    return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
    req: Request
): any { // Relaxando o tipo para evitar o erro de restrição 'never' no Pick
    return {
        httpOnly: true,
        path: "/",
        sameSite: "none",
        secure: isSecureRequest(req),
    };
}
