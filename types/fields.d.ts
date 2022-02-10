export interface IFields {}

export interface IQueueFields extends IFields {
	consumerCount: number
}

export interface IAssertQueueFields extends IQueueFields {
	queue: string,
	messageCount: number
}

export interface ICheckQueueFields extends IAssertQueueFields {}
export interface IDeleteQueueFields extends IQueueFields { }
export interface IPurgeQueueFields extends IQueueFields {}
export interface IBindQueueFields extends IFields {}
export interface IUnbindQueueFields extends IBindQueueFields {}

export interface IAssertExchangeFields extends IFields {
	exchange: string
}
export interface ICheckExchangeFields extends IFields {
	exchange: string
}
export interface IDeleteExchangeFields extends IFields {}
export interface IBindExchangeFields extends IFields {}
export interface IUnbindExchangeFields extends IFields {}

export interface IConsumeFields extends IFields {
	consumerTag: string
}
