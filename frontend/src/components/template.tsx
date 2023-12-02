import { tokenService } from "@/services/tokenService";
import { Grid, Heading, Stack } from "@chakra-ui/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavLinks = [
  {
    title: "Estoques",
    to: "/estoques"
  },
  {
    title: "Relatórios",
    to: "/relatorios"
  },
  {
    title: "Incluir Lançamento",
    to: "/incluir-lancamento"
  },
  {
    title: "Embarques",
    to: "/embarques"
  },
  {
    title: "Lista de produtos",
    to: "/produtos"
  },
  {
    title: "Reservas",
    to: "/reservas"
  }
];

export function Template(props: PropsWithChildren) {
  // verifying if the user is authenticated
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const navigator = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/" && !isAuthorized) {
      if (!tokenService.getLocalRefreshToken()) {
        navigator("/");
      } else {
        setIsAuthorized(true);
      }
    } else if (location.pathname === "/") setIsAuthorized(false);
  }, [location]);

  if (!isAuthorized) return <>{props.children}</>;

  return (
    <Grid
      templateAreas={{
        base: "'header header' 'aside aside' 'main main'",
        md: "'header header header' 'aside main main'"
      }}
      templateColumns={{
        md: "auto 230px 1fr"
      }}
      templateRows={{
        md: "80px 1fr"
      }}
      height="100vh"
      overflow={"hidden"}
    >
      <header
        className="h-[80px] w-screen bg-[#FF9F9F] p-6"
        style={{ gridArea: "header" }}
      >
        <Stack className="h-full" justify={"center"}>
          <Link to={"/estoques"}>
            <Heading
              fontWeight={"normal"}
              size={"lg"}
              fontFamily="'Poppins', sans-serif"
            >
              Lojas Erica
            </Heading>
          </Link>
        </Stack>
      </header>
      <aside
        className="md:w-[230px] bg-[#534D56] py-2 md:p-6 md:h-[calc(100vh-80px)]]"
        style={{ gridArea: "aside" }}
      >
        <ul className="flex md:flex-col flex-wrap md:flex-none items-center md:items-start justify-center md:justify-start gap-4 md:gap-2">
          {NavLinks.map((link, i) => (
            <li key={`${link}-${i}-link`}>
              <Link
                to={link.to}
                className={`${
                  location.pathname.includes(link.to)
                    ? "text-[#68D293]" // is in link's pathname
                    : "text-[#FF9F9F] hover:opacity-70" // isn't in link's pathname
                } text-lg underline`}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main
        className="pb-20 md:pb-0 p-6  overflow-auto min-h-[calc(100vh-80px)]"
        style={{ gridArea: "main" }}
      >
        {props.children}
      </main>
    </Grid>
  );
}
