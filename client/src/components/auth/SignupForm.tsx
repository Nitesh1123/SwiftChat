import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "@/styles.css";
import { toast } from "sonner";

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
}

const SignupForm = ({ toggleView }: SignUpFormProp) => {
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
          Already have an account?{" "}
          <button type="button" onClick={toggleView} className="btn">
            Sign in
          </button>
        </p>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>

              <FormControl>
                <div className="control">
                  <Input
                    {...field}
                    placeholder="Name"
                    className="h-10 w-full bg-transparent border-0 shadow-none
                               focus-visible:ring-0 focus-visible:ring-offset-0
                               p-0 px-3"
                  />
                  <i className="ai-person" />
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

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <label>Password</label>

              <FormControl>
                <div className="control">
                  <Input
                    type="password"
                    {...field}
                    placeholder="●●●●●●●●●●●●●●●"
                    className="h-10 w-full bg-transparent border-0 shadow-none
                               focus-visible:ring-0 focus-visible:ring-offset-0
                               p-0 px-3"
                  />
                  <i className="ai-lock-on" />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <button type="submit">SIGN UP</button>
      </form>
    </Form>
  );
};

export default SignupForm;
