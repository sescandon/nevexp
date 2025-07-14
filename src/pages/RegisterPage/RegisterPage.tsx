import { Container } from "react-bootstrap";
import { RegisterForm } from "../../components/forms/RegisterForm/RegisterForm";

export function RegisterPage() {
  return (
    <Container className="mt-4 d-flex justify-content-center align-items-center flex-column">
      <h2 className="text-white">Crea una nueva cuenta</h2>
      <RegisterForm />
      <p className="text-white mt-3">
        ¿Ya tienes una cuenta?{" "}
        <a href="/login" className="text-white">
          Inicia sesión aquí
        </a>
      </p>
    </Container>
  );
}
