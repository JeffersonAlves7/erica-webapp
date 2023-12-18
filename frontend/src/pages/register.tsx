import { authService } from "@/services/authService";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Register() {
  const toast = useToast();

  const [error, setError] = useState<string>("");
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const navigator = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    authService
      .profile()
      .then(() => setIsLogged(true))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailValue = emailRef.current?.value;
    const passValue = passRef.current?.value;
    const nameValue = nameRef.current?.value;

    if (!emailValue || !passValue || !nameValue) {
      setError("Nome, email e senha precisam ser preenchidos!");
      return;
    }

    try {
      await authService.register(nameValue, emailValue, passValue);
      toast({
        title: "Usuário registrado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error: any) {
      toast({
        title: "Erro ao logar",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    navigator("/estoques");
    return;
  }

  if (isLogged) {
    navigator("/estoques");
    return <></>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box
        marginX={"auto"}
        marginTop={"10vh"}
        shadow={"xl"}
        paddingTop={"5rem"}
        borderRadius={6}
        w={450}
        h={550}
        border={"1px"}
        borderColor={"#D3D3D3"}
      >
        <Stack
          direction={"column"}
          align={"center"}
          justify={"center"}
          gap={"2rem"}
        >
          <Heading size={"lg"}>Faça seu registro!</Heading>

          <FormControl w={300}>
            <FormLabel>Nome</FormLabel>
            <Input
              type="text"
              placeholder="Seu nome de usuário"
              ref={nameRef}
              required
            />
          </FormControl>

          <FormControl w={300}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="example@email.com"
              ref={emailRef}
              required
            />
          </FormControl>

          <FormControl w={300}>
            <FormLabel>Senha</FormLabel>
            <Input
              type="password"
              placeholder="********"
              ref={passRef}
              required
            />
          </FormControl>

          <Stack w={300} align={"flex-end"}>
            <Button
              backgroundColor={"#68D293"}
              _hover={{ backgroundColor: "#7BF9AD" }}
              size={"md"}
              w={100}
              type="submit"
            >
              Confirmar
            </Button>
          </Stack>
          {error ?? (
            <Alert status="error" w={300}>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </Stack>
      </Box>
    </form>
  );
}
