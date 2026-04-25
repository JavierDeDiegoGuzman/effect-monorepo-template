import { scrypt as nodeScrypt, randomBytes, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { Effect, Layer, ServiceMap } from "effect"

const scrypt = promisify(nodeScrypt)

const toHex = (buffer: Uint8Array) => Buffer.from(buffer).toString("hex")
const fromHex = (value: string) => Buffer.from(value, "hex")

export class Passwords extends ServiceMap.Service<
  Passwords,
  {
    readonly hash: (password: string) => Effect.Effect<string>
    readonly verify: (password: string, hash: string) => Effect.Effect<boolean>
  }
>()("app/Passwords") {
  static readonly layer = Layer.succeed(
    Passwords,
    Passwords.of({
      hash: (password: string) =>
        Effect.tryPromise({
          try: async () => {
            const salt = randomBytes(16)
            const derived = (await scrypt(password, salt, 64)) as Buffer
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
            const actual = (await scrypt(
              password,
              salt,
              expected.length,
            )) as Buffer
            return timingSafeEqual(expected, actual)
          },
          catch: (error) =>
            new Error(`Failed to verify password: ${String(error)}`),
        }).pipe(Effect.orDie),
    }),
  )
}
