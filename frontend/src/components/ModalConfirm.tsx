import {
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay
} from "@chakra-ui/react";
import { CancelButton } from "./buttons/cancelButton";
import { ConfirmButton } from "./buttons/confirmButton";
import { PropsWithChildren } from "react";

interface ModalDeleteProps extends PropsWithChildren {
  onClose: () => void;
  isOpen: boolean;
  handleConfirm: () => void;
}

export function ModalConfirm(props: ModalDeleteProps) {
  const { onClose, isOpen, handleConfirm, children } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent alignSelf={"center"} p={5}>
        <ModalBody>
          <Heading size={"md"} textAlign={"center"}>
            {children}
          </Heading>
        </ModalBody>
        <ModalFooter>
          <Flex m={"auto"} gap={10}>
            <CancelButton onClick={onClose} />
            <ConfirmButton onClick={handleConfirm} />
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
