import { HttpException, HttpStatus } from '@nestjs/common';

export class TransactionNoTranserencesToConfirmError extends HttpException {
  constructor() {
    super('No transferences to confirm', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionIdNotFoundError extends HttpException {
  constructor() {
    super('Id da transação não encontrado', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionTransferencesMustBeAnArrayError extends HttpException {
  constructor() {
    super('Transferencias deve ser um array', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionMaxTransferencePerRequestError extends HttpException {
  constructor() {
    super('Máximo de 100 transferencias por vez', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionsExitAmountNotFoundError extends HttpException {
  constructor() {
    super('Quantidade de saída não encontrada', HttpStatus.BAD_REQUEST);
  }
}

export class TransferenceEntryAmountNotFoundError extends HttpException {
  constructor() {
    super('Quantidade de entrada não encontrada', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionClientNotFoundError extends HttpException {
  constructor() {
    super('Cliente não encontrado', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionIdIsRequiredError extends HttpException {
  constructor() {
    super('Id da transação é obrigatório', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionNotFoundError extends HttpException {
  constructor() {
    super('Transação não encontrada', HttpStatus.BAD_REQUEST);
  }
}

export class TransactionAlreadyConfirmedError extends HttpException {
  constructor() {
    super('Transação já confirmada', HttpStatus.BAD_REQUEST);
  }
}