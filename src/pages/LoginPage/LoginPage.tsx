import { Container } from "react-bootstrap";
import { LoginForm } from "../../components/forms/LoginForm/LoginForm";

export function LoginPage() {
  return (
    <Container className="mt-4 d-flex justify-content-center align-items-center flex-column">
      <h2 className="text-white">Ingresa a tu cuenta</h2>
      <LoginForm />
      <p className="text-white mt-3">
        ¿No tienes una cuenta?{" "}
        <a href="/register" className="text-white">
          Regístrate aquí
        </a>
      </p>
    </Container>
  );
}
