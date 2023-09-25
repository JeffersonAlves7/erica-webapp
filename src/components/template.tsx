import { Box, Heading, Stack } from "@chakra-ui/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NavLinks = [
   {
    title: 'Estoques',
    to: '/home'
   },
   {
    title: 'Relatórios',
    to: '/relatorios'
   },
   {
    title: 'Incluir Lançamento',
    to: '/incluir-lancamento'
   },
]

export function Template(props: PropsWithChildren) {
  // verifying if the user is authenticated
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/" && !isAuthorized) setIsAuthorized(true);
    else if (location.pathname === "/") setIsAuthorized(false);
  }, [location]);

  if (!isAuthorized) return <>{props.children}</>;

  return (
    <Box
      className="grid"
      gridTemplateAreas="'header header header' 'aside main main'"
      gridTemplateColumns="auto 230px 1fr"
      gridTemplateRows="80px 1fr"
      height="100vh"
    >
      <header
        className="h-[80px] w-screen bg-[#FF9F9F] p-6"
        style={{ gridArea: "header" }}
      >
        <Stack className="h-full" justify={"center"}>
          <Link to={"/home"}>
            <Heading fontWeight={"normal"} fontFamily="'Poppins', sans-serif">
              Lojas Erica
            </Heading>
          </Link>
        </Stack>
      </header>
      <aside
        className="w-[230px] bg-[#534D56] p-6"
        style={{ gridArea: "aside", height: "calc(100vh - 80px)" }}
      >
        <ul className="flex flex-col gap-2">
          {NavLinks.map((link, i) => (
            <li key={`${link}-${i}-link`}>
              <Link
                to={link.to}
                className={`${
                  location.pathname == link.to
                    ? "text-[#68D293]" // is in link's pathname
                    : "text-[#FF9F9F] hover:opacity-70"  // isn't in link's pathname
                } text-lg underline`}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main
        className="p-6"
        style={{ gridArea: "main", height: "calc(100vh - 80px)" }}
      >
        {props.children}
      </main>
    </Box>
  );
}
