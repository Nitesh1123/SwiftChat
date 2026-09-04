import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "Name must contain atleast 3 characters",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(10)
    .pattern(new RegExp("(?=.*[a-z])"))
    .pattern(new RegExp("(?=.*[A-Z])")) 
    .pattern(new RegExp("(?=.*\\d)")) 
    .pattern(new RegExp("(?=.*[^a-zA-Z0-9])"))
    .required()
    .messages({
      "string.min": "Password must be at least 10 characters long",
      "string.pattern.base":
        "Password must include uppercase, lowercase, number, and special character",
      "any.required": "Password is required",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
