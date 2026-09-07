import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

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
}

const SigninForm = ({ toggleView }: SignInFormProp) => {
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
        className="active"
        autoComplete="off"
      >
        <p>
          Don't have an account?{" "}
          <button type="button" onClick={toggleView} className="btn">
            Sign up
          </button>
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <label>Email</label>
              <FormControl>
                <div className="control">
                  <Input
                    {...field}
                    placeholder="youremail@gmail.com"
                    className="h-10 w-full bg-transparent border-0 shadow-none
                           focus-visible:ring-0 focus-visible:ring-offset-0
                           p-0 px-3"
                  />
                  <i className="ai-envelope" />
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
              <label>Password</label>
              <FormControl>
                <div className="control" style={{ position: "relative" }}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    placeholder="●●●●●●●●●●●●●●●"
                    className="h-10 w-full bg-transparent border-0 shadow-none
                           focus-visible:ring-0 focus-visible:ring-offset-0
                           p-0 px-3 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#aaa",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
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

        <button type="submit">Sign in</button>
        <p className="footer">
          By clicking Sign In you agree to our terms and conditions, privacy
          policy and reusability rules.
        </p>
      </form>
    </Form>
  );
};

export default SigninForm;
