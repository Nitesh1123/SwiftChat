import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { toast } from "sonner";
import "@/index.css";
import "@/styles.css";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { loginApi } from "@/services/auth.service";
import type { AxiosError } from "axios";
import { useUser } from "@/context/useUser";
import { useNavigate } from "react-router-dom";

interface SignInFormProp {
  toggleView: () => void;
  active?: boolean;
}

const SigninForm = ({ toggleView, active = true }: SignInFormProp) => {
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await loginApi(data);
      const { success, message, user } = res.data;

      if (!success) {
        toast.error(message);
        return;
      }

      setUser(user)
      toast(`Welcome back, ${user.name}`);
      navigate('/chat')
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Invalid email or password");
    }
  };

  const showValidationErrorToast = () => {
    const errors = form.formState.errors;

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
          Sign in
          <ArrowRight size={17} strokeWidth={2.2} />
        </button>
        <p className="text-center text-[13px] text-paper-dim">
          Don't have an account?{" "}
          <button type="button" onClick={toggleView} className="btn-link">
            Sign up
          </button>
        </p>
        <p className="text-center text-[11.5px] leading-relaxed text-paper-faint">
          By clicking Sign In you agree to our terms and conditions, privacy
          policy and reusability rules.
        </p>
      </form>
    </Form>
  );
};

export default SigninForm;
