/**
 * Ojo: Mejor no usar este nombre que hay una por ahí que se llama igual
 */
export interface JwtPayload {

    id: string;
    iat?: number; // de momento no se usan, supongo que en vídeos futuros se acaben usando
    exp?: number;
}