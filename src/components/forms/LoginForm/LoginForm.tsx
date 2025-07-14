import { useLoginForm } from "./useLoginForm";
import styles from "../commonForm.module.less";

export function LoginForm() {
  const { isSubmitted, error, register, onSubmit, errors } = useLoginForm();

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

      <button type="submit" className={styles.submitButton}>
        Login
      </button>

      {isSubmitted && (
        <p className={styles.successMessage}>Login successful!</p>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
