import { productService } from "@/services/productService";
import { tokenService } from "@/services/tokenService";
import { PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProtectedRoute(props: PropsWithChildren<any>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigate();

  useEffect(() => {
    const accessToken = tokenService.getLocalAccessToken();

    if (!accessToken) {
      setIsAuthenticated(false);
      navigation("/");
      return;
    }
    productService
      .getProducts({ limit: 1, page: 1 })
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          tokenService.removeLocalAccessToken();
          tokenService.removeLocalRefreshToken();
          navigation("/");
        }
      });
  }, [navigation]);

  if (!isAuthenticated) {
    return <></>;
  }

  return <>{props.children}</>;
}
