export type ExchangeTypes = 'direct' | 'fanout' | 'topic' | 'match' | 'headers'

export type ErrorCallback = (error: Error | null) => void

export type Callback<T> = (error: Error | null, value: T | undefined) => void

export interface MessageFields {
	consumerTag: string
	deliveryTag: number
	redelivered: Boolean
	exchange: string
	routingKey: string
}

export interface MessageHeaders {
	contentType?: string
	contentEncoding?: string
	headers?: Object
	deliveryMode?: string
	priority?: string
	correlationId?: string
	replyTo?: string
	expiration?: any
	messageId?: string
	timestamp?: any
	type?: string
	userId?: string
	appId?: string
	clusterId?: string
}

export interface Message {
	fields: MessageFields
	properties: MessageHeaders
	content: Buffer
}

export type MessageListener = (message: Message) => void

export class IllegalOperationError extends Error {
	constructor(message: string, stack: string)
}

interface Credential<M = string> {
	mechanism: M,
	response: () => Buffer,
	username?: string,
	password?: string
}

export interface Credentials {
	plain (user: string, password: string): Credential<'PLAIN'>
	amqplain (user: string, password: string): Credential<'AMQPLAIN'>
	external (): Credential<'EXTERNAL'>
}

export interface SocketOptions {
	protocol: 'amqp' | 'ampqs'
	hostname: string
	port: number
	username: string
	password: string
	locale: string
	frameMax: number
	heartbeat: number
	vhost: string
}
