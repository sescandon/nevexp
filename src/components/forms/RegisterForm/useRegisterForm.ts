import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerFormSchema,
  RegisterFormFields,
} from "../../../schemas/userSchemas";

export const useRegisterForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormFields>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
    try {
      console.log("Register data submitted:", data);
      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError("Register failed. Please try again.");
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
