import { scrypt as nodeScrypt, randomBytes, timingSafeEqual } from "node:crypto"
import { Passwords } from "@app/backend-domain"
import { Effect, Layer } from "effect"

const scrypt = (
  password: string,
  salt: Uint8Array,
  keylen: number,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    nodeScrypt(password, salt, keylen, (error, derivedKey) => {
      if (error !== null) {
        reject(error)
        return
      }

      resolve(Buffer.from(derivedKey))
    })
  })

const toHex = (buffer: Uint8Array) => Buffer.from(buffer).toString("hex")
const fromHex = (value: string) => Buffer.from(value, "hex")

export const PasswordsLive = Layer.succeed(
  Passwords,
  Passwords.of({
    hash: (password: string) =>
      Effect.tryPromise({
        try: async () => {
          const salt = randomBytes(16)
          const derived = await scrypt(password, salt, 64)
          return `${toHex(salt)}:${toHex(derived)}`
        },
        catch: (error) =>
          new Error(`Failed to hash password: ${String(error)}`),
      }).pipe(Effect.orDie),
    verify: (password: string, hash: string) =>
      Effect.tryPromise({
        try: async () => {
          if (hash.startsWith("seed:")) {
            return password === hash.slice(5)
          }

          const [saltHex, derivedHex] = hash.split(":")
          if (saltHex === undefined || derivedHex === undefined) {
            return false
          }

          const salt = fromHex(saltHex)
          const expected = fromHex(derivedHex)
          const actual = await scrypt(password, salt, expected.length)
          return timingSafeEqual(expected, actual)
        },
        catch: (error) =>
          new Error(`Failed to verify password: ${String(error)}`),
      }).pipe(Effect.orDie),
  }),
)
