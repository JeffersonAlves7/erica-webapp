import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from "@chakra-ui/react";
import { useRef, useState } from "react";

export function Login() {
  const [error, setError] = useState<string>("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailValue = emailRef.current?.value;
    const passValue = passRef.current?.value;

    if (!emailValue || !passValue) {
      setError("Email e senha precisam ser preenchidos!");
      return;
    }

    console.log({
      emailValue,
      passValue
    });

    return;
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
        h={500}
        border={"1px"}
        borderColor={"#D3D3D3"}
      >
        <Stack
          direction={"column"}
          align={"center"}
          justify={"center"}
          gap={"2rem"}
        >
          <Heading size={"lg"}>Faça seu Login!</Heading>
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
