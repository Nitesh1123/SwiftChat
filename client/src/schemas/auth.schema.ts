import { z} from "zod"


export const loginSchema = z.object({
    email: z.string().email("Enter valid email"),
    password: z.string().min(6, "Password must be of minimum 6 character")
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must contain atleast 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(
      /(?=.*[a-z])/,
      "Password must include uppercase, lowercase, number, and special character"
    )
    .regex(
      /(?=.*[A-Z])/,
      "Password must include uppercase, lowercase, number, and special character"
    )
    .regex(
      /(?=.*\d)/,
      "Password must include uppercase, lowercase, number, and special character"
    )
    .regex(
      /(?=.*[^a-zA-Z0-9])/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;