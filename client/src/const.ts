export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime - Adaptado para o fluxo do Clerk
export const getLoginUrl = () => {
    // Como vamos usar Clerk, o redirecionamento geralmente é feito via hooks do Clerk
    // Mas mantemos a função para compatibilidade com o main.tsx que a chama
    return "/sign-in";
};
