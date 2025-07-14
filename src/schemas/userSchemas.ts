import z from "zod";

export const loginFormSchema = z.object({
  email: z.email("Email inválido").nonempty("El email es requerido"),
  password: z
    .string()
    .nonempty("La contraseña es requerida")
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    })
    .refine((password) => /[A-Z]/.test(password), {
      message: "La contraseña debe tener al menos una letra mayúscula",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "La contraseña debe tener al menos una letra minúscula",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "La contraseña debe tener al menos un número",
    })
    .refine((password) => /[`!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: "La contraseña debe tener al menos un caracter especial",
    }),
});

export interface LoginFormFields {
  email: string;
  password: string;
}

export const registerFormSchema = z
  .object({
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .refine((password) => /[A-Z]/.test(password), {
        message: "La contraseña debe tener al menos una letra mayúscula",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "La contraseña debe tener al menos una letra minúscula",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "La contraseña debe tener al menos un número",
      })
      .refine(
        (password) => /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password),
        {
          message: "La contraseña debe tener al menos un caracter especial",
        }
      ),
    confirmPassword: z
      .string()
      .min(1, "La confirmación de la contraseña es requerida"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export interface RegisterFormFields extends LoginFormFields {
  confirmPassword: string;
}
