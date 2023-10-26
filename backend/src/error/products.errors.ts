import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductInvalidProductsError extends HttpException {
  constructor() {
    super('Produtos inválidos', HttpStatus.BAD_REQUEST);
  }
}

export class ProductNotFoundError extends HttpException {
  constructor() {
    super('Produto não encontrado', HttpStatus.BAD_REQUEST);
  }
}

export class ProductInsuficientStockError extends HttpException {
  constructor() {
    super('Estoque insuficiente', HttpStatus.BAD_REQUEST);
  }
}

export class ProductCodeOrEanIsRequiredError extends HttpException {
  constructor() {
    super('Código ou EAN é obrigatório', HttpStatus.BAD_REQUEST);
  }
}

export class ProductEanIsRequiredError extends HttpException {
  constructor() {
    super('Código ou EAN é obrigatório', HttpStatus.BAD_REQUEST);
  }
}

export class ProductCodeIsRequiredError extends HttpException {
  constructor() {
    super('Código ou EAN é obrigatório', HttpStatus.BAD_REQUEST);
  }
}

export class ProductQuantityIsRequiredError extends HttpException {
  constructor(
    quantityName:
      | 'Quantidade'
      | 'Quantidade de entrada'
      | 'Quantidade de saida' = 'Quantidade',
  ) {
    super(`${quantityName} é obrigatório`, HttpStatus.BAD_REQUEST);
  }
}

export class ProductImporterIsRequiredError extends HttpException {
  constructor() {
    super('Importadora é obrigatória', HttpStatus.BAD_REQUEST);
  }
}

export class ProductContainerIsRequiredError extends HttpException {
  constructor() {
    super('Container é obrigatório', HttpStatus.BAD_REQUEST);
  }
}

export class ProductStockIsRequiredError extends HttpException {
  constructor(sentido: 'origem' | 'destino' | 'saída') {
    super(`Estoque de ${sentido} é obrigatório`, HttpStatus.BAD_REQUEST);
  }
}

export class ProductAlreadyInContainerError extends HttpException {
  constructor(containerId: any) {
    super(
      `Produto não encontrado no container ${containerId}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ProductQuantityIsnotEnoughError extends HttpException {
  constructor() {
    super('Quantidade insuficiente', HttpStatus.BAD_REQUEST);
  }
}

export class ProductOperatorIsRequiredError extends HttpException {
  constructor() {
    super('Operador é obrigatório', HttpStatus.BAD_REQUEST);
  }
}

export class ProductTransactionIdNotFoundError extends HttpException {
  constructor() {
    super('Id da transação não encontrado', HttpStatus.BAD_REQUEST);
  }
}
export class ProductAlreadyExistsInOtherImporterError extends HttpException {
  constructor() {
    super('Produto já existe em outra importadora', HttpStatus.BAD_REQUEST);
  }
}

export class ProductAlreadyExistsWithOtherCodeError extends HttpException {
  constructor() {
    super(
      'Produto já existe com esse EAN e outro código',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ProductClientIsRequiredError extends HttpException {
  constructor() {
    super('Cliente é obrigatório', HttpStatus.BAD_REQUEST);
  }
}