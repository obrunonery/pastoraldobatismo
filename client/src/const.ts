export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime - Adaptado para o fluxo do Clerk
export const getLoginUrl = () => {
    return "/login";
};
