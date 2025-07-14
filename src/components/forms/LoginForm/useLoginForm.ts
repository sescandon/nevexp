import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormFields } from "../../../schemas/userSchemas";

export const useLoginForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    try {
      console.log("Login data submitted:", data);
      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return {
    isSubmitted,
    error,
    setIsSubmitted,
    setError,
    register,
    onSubmit: handleSubmit(onSubmit),
    errors,
  };
};
