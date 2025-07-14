import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export function NavBar() {
  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">NeverExp</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/about">¿Quiénes somos?</Nav.Link>
          <Nav.Link href="#features">Features</Nav.Link>
          <Nav.Link href="#pricing">Pricing</Nav.Link>
        </Nav>
      </Container>
      <Nav className="me-auto">
        <Nav.Link href="/login">Ingresar</Nav.Link>
      </Nav>
    </Navbar>
  );
}
