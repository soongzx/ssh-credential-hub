/**
 * 加密服务
 * 使用 AES-256-GCM 加密敏感字段
 * 密钥通过机器特征生成
 */
import crypto from 'crypto'
import os from 'os'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

/**
 * 生成机器特征密钥
 * 组合多个硬件/系统特征，确保密钥与当前设备绑定
 */
function generateMachineKey(): Buffer {
  const features = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus()[0]?.model ?? 'unknown',
    os.totalmem().toString()
  ]

  const featureString = features.join('|')
  return crypto.scryptSync(featureString, 'ssh-credential-hub-salt', 32)
}

/**
 * 获取加密密钥
 * 缓存密钥避免重复计算
 */
const getKey = (() => {
  let key: Buffer | null = null
  return (): Buffer => {
    if (!key) {
      key = generateMachineKey()
    }
    return key
  }
})()

/**
 * 加密明文
 * @param plaintext - 待加密的明文
 * @returns 包含 salt + iv + authTag + ciphertext 的 base64 字符串
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  // 组合：salt + iv + authTag + encrypted
  const result = Buffer.concat([salt, iv, authTag, encrypted])
  return result.toString('base64')
}

/**
 * 解密密文
 * @param ciphertext - encrypt 生成的 base64 字符串
 * @returns 解密后的明文
 * @throws 解密失败时抛出错误
 */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const data = Buffer.from(ciphertext, 'base64')

  // 提取各部分
  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  )
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

  // 清空敏感数据
  encrypted.fill(0)

  return decrypted.toString('utf8')
}
