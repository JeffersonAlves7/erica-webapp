import { Button, Flex, Link } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface LinkSelectorProps {
  links: { title: string; to: string, or?: string[] }[];
  onClick?: (index: number) => void;
  keyPrefix?: string;
  className?: string;
}

export function LinkSelector(props: LinkSelectorProps) {
  const location = useLocation();
  
  const [selected, setSelected] = useState(
    props.links.findIndex(
      (link) =>
        link.to === location.pathname || link?.or?.includes(location.pathname)
    )
  );

  return (
    <Flex className={props.className ? props.className : 'gap-6 flex-wrap'}>
      {props.links.map((link, index) => (
        <Link
        key={"link-sel-" + (props.keyPrefix ?? "") + "-" + index}
        as={RouterLink} to={link.to}>
          <Button
            backgroundColor={selected === index ? "erica.green" : "erica.pink"}
            colorScheme={selected === index ? "green" : "pink"}
            onClick={() => {
              setSelected(index);
              props.onClick && props.onClick(index);
            }}
          >
            {link.title}
          </Button>
        </Link>
      ))}
    </Flex>
  );
}
