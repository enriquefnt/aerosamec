import { prisma } from "@/lib/db";
import { Usuario } from "@prisma/client";

type TokenContext =
  | "RESET_PASSWORD"
  | "FIRST_LOGIN";

export async function resolveUserByToken(
  token: string
): Promise<{ usuario: Usuario; context: TokenContext } | null> {

  console.log("🔐 resolveUserByToken → token recibido:", token.slice(0, 8) + "...");

  // 🔹 Reset password
  const resetUser = await prisma.usuario.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (resetUser) {
    console.log(
      "✅ Token válido (RESET_PASSWORD)",
      { userId: resetUser.id, email: resetUser.email }
    );

    return {
      usuario: resetUser,
      context: "RESET_PASSWORD",
    };
  }

  // 🔹 Primer ingreso
  const firstLoginUser = await prisma.usuario.findFirst({
    where: {
      tokenVerificacion: token,
      emailVerificado: true,
    },
  });

  if (firstLoginUser) {
    console.log(
      "✅ Token válido (FIRST_LOGIN)",
      { userId: firstLoginUser.id, email: firstLoginUser.email }
    );

    return {
      usuario: firstLoginUser,
      context: "FIRST_LOGIN",
    };
  }

  console.warn("❌ Token inválido o expirado");
  return null;
}
