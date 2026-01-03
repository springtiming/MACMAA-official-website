import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const SALT_ROUNDS = 12; // bcrypt成本因子

/**
 * 生成密码哈希
 * @param password 明文密码
 * @returns 密码哈希字符串
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hash 存储的密码哈希
 * @returns 如果密码匹配返回true，否则返回false
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}






