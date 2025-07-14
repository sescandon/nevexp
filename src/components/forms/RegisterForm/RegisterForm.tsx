import { useRegisterForm } from "./useRegisterForm";
import styles from "../commonForm.module.less";

export function RegisterForm() {
  const { isSubmitted, error, register, onSubmit, errors } = useRegisterForm();

  return (
    <form onSubmit={onSubmit} className={styles.loginForm}>
      <div className={styles.formGroup}>
        <label>Email:</label>
        <input
          {...register("email")}
          className={errors.email ? styles.error : ""}
        />
        {errors.email && (
          <span className={styles.errorMessage}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Password:</label>
        <input
          type="password"
          {...register("password")}
          className={errors.password ? styles.error : ""}
        />
        {errors.password && (
          <span className={styles.errorMessage}>{errors.password.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Confirm Password:</label>
        <input
          type="password"
          {...register("confirmPassword")}
          className={errors.confirmPassword ? styles.error : ""}
        />
        {errors.confirmPassword && (
          <span className={styles.errorMessage}>
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button type="submit" className={styles.submitButton}>
        Register
      </button>

      {isSubmitted && (
        <p className={styles.successMessage}>Registration successful!</p>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
