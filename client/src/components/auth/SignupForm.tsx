import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "@/styles.css";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { registerApi } from "@/services/auth.service";
import {AxiosError } from "axios";

interface SignUpFormProp {
  toggleView: () => void;
  active?: boolean;
}

const SignupForm = ({ toggleView, active = true }: SignUpFormProp) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await registerApi(data);
      const {success, message} = res.data;
      if(!success){
        return toast.error(message || "Registration failed");
      }
      toast("Account created successfully. Please log in.");
      toggleView();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data?.message ||
        "Not able to register. Please try again later"
      );
    }
  };

  const showValidationErrorToast = () => {
    const errors = form.formState.errors;

    if (errors.name) {
      toast.error(errors.name.message || "Invalid name");
      return;
    }

    if (errors.email) {
      toast.error(errors.email.message || "Invalid email");
      return;
    }

    if (errors.password) {
      toast.error(errors.password.message || "Invalid password");
      return;
    }

    toast.error("Please fix the errors in the form");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, showValidationErrorToast)}
        data-active={active}
        aria-hidden={!active}
        autoComplete="off"
      >

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="field-label">Name</FormLabel>
              <FormControl>
                <div className="field-control">
                  <UserRound className="field-icon" />
                  <Input
                    {...field}
                    placeholder="Your full name"
                    className="field-input"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <label className="field-label">Email</label>
              <FormControl>
                <div className="field-control">
                  <Mail className="field-icon" />
                  <Input
                    {...field}
                    placeholder="you@example.com"
                    className="field-input"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <label className="field-label">Password</label>
              <FormControl>
                <div className="field-control">
                  <LockKeyhole className="field-icon" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    placeholder="••••••••••"
                    className="field-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="field-toggle"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <button type="submit" className="btn-shu mt-2">
          Create account
          <ArrowRight size={17} strokeWidth={2.2} />
        </button>
        <p className="text-center text-[13px] text-paper-dim">
          Already have an account?{" "}
          <button type="button" onClick={toggleView} className="btn-link">
            Sign in
          </button>
        </p>
      </form>
    </Form>
  );
};

export default SignupForm;
