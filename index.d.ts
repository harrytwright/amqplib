import { EventEmitter } from 'events'
import {
	ExchangeTypes,
	Message,
	MessageListener,
	Callback,
	ErrorCallback,
	SocketOptions,
	Credentials
} from './types/common'
import {
	IFields,
	IBindExchangeFields,
	IAssertExchangeFields,
	IAssertQueueFields,
	IPurgeQueueFields,
	IDeleteQueueFields,
	IBindQueueFields,
	ICheckExchangeFields,
	ICheckQueueFields,
	IDeleteExchangeFields,
	IUnbindQueueFields,
	IConsumeFields
} from './types/fields'
import {
	IPublishOptions,
	IDeleteQueueOptions,
	IAssertQueueOptions,
	IAssertExchangeOptions,
	IDeleteExchangeOptions,
	IGetOptions,
	IConsumeOptions
} from './types/options'

declare type AsyncPromise<T> = Promise<T> | never

declare class Connection extends EventEmitter {
	protected constructor(connection: EventEmitter)

	createChannel(): Promise<Channel>

	createConfirmChannel(): Promise<Channel>

	close(): Promise<void>
}

declare class Channel extends EventEmitter {

	/**
	 * A channel will emit `'close'` once the closing handshake (possibly initiated by `#close()`)
	 * has completed; or, if its connection closes.
	 *
	 * When a channel closes, any unresolved operations on the channel will be abandoned (and
	 * the returned promises rejected).
	 * */
	on(eventName: 'close', listener: () => void): this

	/**
	 * A channel will emit `'error'` if the server closes the channel for any reason. Such reasons include
	 *
	 * - An operation failed due to a failed precondition (usually something named in an argument not existing)
	 * - A human closed the channel with an admin tool
	 *
	 * A channel will not emit `'error'` if its connection closes with an error.
	 * */
	on(eventName: 'error', listener: (err: Error) => void): this

	/**
	 * if a message is published with the `mandatory` flag (it’s an option to `Channel#publish` in this API), it
	 * may be returned to the sending channel if it cannot be routed. Whenever this happens, the channel will emit
	 * `return` with a message object (as described in `#consume`) as an argument.
	 * */
	on(eventName: 'return', listener: (message: Message) => void): this

	/**
	 * Like a stream.Writable, a channel will emit 'drain', if it has previously returned false from `#publish `
	 * or `#sendToQueue`, once its write buffer has been emptied (i.e., once it is ready for writes again).
	 * */
	on(eventName: 'drain', listener: () => void): this

	/**
	 * Public
	 * */

	/**
	 * Close a channel. Will be resolved with no value once the closing handshake is complete.
	 *
	 * There’s not usually any reason to close a channel rather than continuing to use it until you’re ready
	 * to close the connection altogether. However, the lifetimes of consumers are scoped to channels, and
	 * thereby other things such as exclusive locks on queues, so it is occasionally worth being deliberate about
	 * opening and closing channels.
	 * */
	close(fn?: ErrorCallback): void

	/**
	 * Queues
	 * */

	/**
	 * Assert a queue into existence. This operation is idempotent given identical arguments; however, it will
	 * bork the channel if the queue already exists but has different properties (values supplied in the
	 * `arguments` field may or may not count for borking purposes; check the borker’s, I mean broker’s, documentation).
	 *
	 * `queue` is a string; if you supply an empty string or other falsey value (including `null` and `undefined`),
	 * the server will create a random name for you.
	 *
	 * options is an object and may be empty or null, or outright omitted if it’s the last argument.
	 * */
	assertQueue(queue: string): AsyncPromise<IAssertQueueFields>
	assertQueue(queue: string, options: Partial<IAssertQueueOptions>): AsyncPromise<IAssertQueueFields>

	/**
	 * Check whether a queue exists. This will bork the channel if the named queue doesn’t exist; if it does exist,
	 * you go through to the next round! There’s no options, unlike `#assertQueue()`, just the queue name. The reply
	 * from the server is the same as for `#assertQueue()`.
	 * */
	checkQueue(queue: string): AsyncPromise<ICheckQueueFields>

	/**
	 * Delete the queue named. Naming a queue that does not exist will result in the server closing the channel,
	 * to teach you a lesson (except in RabbitMQ version 3.2.0 and after1).
	 * */
	deleteQueue(queue: string): AsyncPromise<IDeleteQueueFields>
	deleteQueue(queue: string, options: Partial<IDeleteQueueOptions>): AsyncPromise<IDeleteQueueFields>

	/**
	 * Remove all undelivered messages from the `queue` named. Note that this won’t remove messages that have been
	 * delivered but not yet acknowledged; they will remain, and may be requeued under some circumstances
	 * (e.g., if the channel to which they were delivered closes without acknowledging them).
	 * */
	purgeQueue(queue: string): AsyncPromise<IPurgeQueueFields>

	/**
	 * Assert a routing path from an exchange to a queue: the exchange named by `source` will relay messages to the
	 * `queue` named, according to the type of the exchange and the `pattern` given. The RabbitMQ tutorials give a good
	 * account of how routing works in AMQP.
	 *
	 * `args` is an object containing extra arguments that may be required for the particular exchange type
	 * (for which, see your server’s documentation). It may be omitted if it’s the last argument, which is
	 * equivalent to an empty object.
	 * */
	bindQueue(queue: string, source: string, pattern: string): AsyncPromise<IBindQueueFields>
	bindQueue(queue: string, source: string, pattern: string, args: object): AsyncPromise<IBindQueueFields>

	/**
	 * Remove a routing path between the `queue` named and the exchange named as source with the `pattern` and arguments
	 * given. Omitting `args` is equivalent to supplying an empty object (no arguments).
	 *
	 * Beware: attempting to unbind when there is no such binding may result in a punitive error
	 * (the AMQP specification says it’s a connection-killing mistake; RabbitMQ before version 3.2.0 softens this to a
	 * channel error, and from version 3.2.0, does not treat it as an error at all1. Good ol’ RabbitMQ).
	 * */
	unbindQueue(queue: string, source: string, pattern: string): AsyncPromise<IUnbindQueueFields>
	unbindQueue(queue: string, source: string, pattern: string, args: object): AsyncPromise<IUnbindQueueFields>

	/**
	 * Exchanges
	 * */

	/**
	 * Assert an exchange into existence. As with queues, if the exchange exists already and has properties different
	 * to those supplied, the channel will ‘splode; fields in the arguments object may or may not be ‘splodey,
	 * depending on the type of exchange. Unlike queues, you must supply a name, and it can’t be the empty string.
	 * You must also supply an exchange type, which determines how messages will be routed through the exchange.
	 * */
	assertExchange(exchange: string, type: ExchangeTypes): AsyncPromise<IAssertExchangeFields>
	assertExchange(exchange: string, type: ExchangeTypes, options: Partial<IAssertExchangeOptions>): AsyncPromise<IAssertExchangeFields>

	/**
	 * Check that an exchange exists. If it does not exist, the channel will be closed with an error.
	 * If it does exist, happy days.
	 * */
	checkExchange(exchange: string): AsyncPromise<ICheckExchangeFields>

	/**
	 * Delete an exchange.
	 *
	 * If the exchange does not exist, a channel error is raised (RabbitMQ version 3.2.0 and after will not
	 * raise an error1).
	 * */
	deleteExchange(exchange: string): AsyncPromise<IDeleteExchangeFields>
	deleteExchange(exchange: string, options: Partial<IDeleteExchangeOptions>): AsyncPromise<IDeleteExchangeFields>

	/**
	 * Bind an exchange to another exchange. The exchange named by destination will receive messages from the exchange
	 * named by source, according to the type of the source and the pattern given. For example, a direct exchange will
	 * relay messages that have a routing key equal to the pattern.
	 *
	 * @note Exchange to exchange binding is a RabbitMQ extension.
	 * */
	bindExchange(destination: string, source: string, pattern: string): AsyncPromise<IBindExchangeFields>
	bindExchange(destination: string, source: string, pattern: string, args: object): AsyncPromise<IBindExchangeFields>

	/**
	 * Remove a binding from an exchange to another exchange. A binding with the exact `source` exchange,
	 * `destination` exchange, routing key `pattern`, and extension `args` will be removed. If no such binding exists,
	 * it’s – you guessed it – a channel error, except in RabbitMQ >= version 3.2.0, for which it succeeds trivially1.
	 * */
	unbindExchange(destination: string, source: string, pattern: string): AsyncPromise<IBindExchangeFields>
	unbindExchange(destination: string, source: string, pattern: string, args: object): AsyncPromise<IBindExchangeFields>

	/**
	 * Using
	 * */

	/**
	 * Publish a single message to an exchange.
	 *
	 * `#publish` mimics the `stream.Writable` interface in its return value; it will return `false` if the channel’s
	 * write buffer is ‘full’, and `true` otherwise. If it returns `false`, it will emit a 'drain' event at some
	 * later time.
	 * */
	publish(exchange: string, routingKey: string, content: Buffer): boolean
	publish(exchange: string, routingKey: string, content: Buffer, options: Partial<IPublishOptions>): boolean

	/**
	 * Send a single message with the `content` given as a buffer to the specific queue named, bypassing routing.
	 *
	 * @see publish
	 * */
	sendToQueue(queue: string, content: Buffer): boolean
	sendToQueue(queue: string, content: Buffer, options: Partial<IPublishOptions>): boolean

	/**
	 * Set up a consumer with a callback to be invoked with each message.
	 * */
	consume(queue: string, listener: MessageListener): AsyncPromise<IConsumeFields>
	consume(queue: string, listener: MessageListener, options: Partial<IConsumeOptions>): AsyncPromise<IConsumeFields>

	/**
	 * This instructs the server to stop sending messages to the consumer identified by `consumerTag`.
	 * Messages may arrive between sending this and getting its reply; once the reply has resolved, however,
	 * there will be no more messages for the consumer, i.e., the message callback will no longer be invoked.
	 *
	 * The consumerTag is the string given in the reply to `#consume`, which may have been generated by the server.
	 * */
	cancel(consumerTag: string): AsyncPromise<IFields>

	/**
	 * Ask a queue for a message, as an RPC. This will be resolved with either false, if there is no message to be
	 * had (the queue has no messages ready), or a message in the same shape as detailed in #consume.
	 * */
	get(queue: string): AsyncPromise<Message | Boolean>
	get(queue: string, options: Partial<IGetOptions>): AsyncPromise<Message | Boolean>

	/**
	 * Acknowledge the given message, or all messages up to and including the given message.
	 *
	 * If a `#consume` or `#get` is issued with noAck: false (the default), the server will expect acknowledgements for
	 * messages before forgetting about them. If no such acknowledgement is given, those messages may be requeued once
	 * the channel is closed.
	 *
	 * If `allUpTo` is true, all outstanding messages prior to and including the given message shall be considered
	 * acknowledged. If false, or omitted, only the message supplied is acknowledged.
	 *
	 * It’s an error to supply a message that either doesn’t require acknowledgement, or has already been acknowledged.
	 * Doing so will errorise the channel. If you want to acknowledge all the messages and you don’t have a specific
	 * message around, use `#ackAll`.
	 * */
	ack(message: Message): void
	ack(message: Message, allUpTo: boolean): void

	/**
	 * Acknowledge all outstanding messages on the channel. This is a “safe” operation, in that it won’t result in
	 * an error even if there are no such messages.
	 * */
	ackAll(): void

	/**
	 * Reject a message. This instructs the server to either requeue the message or throw it away
	 * (which may result in it being dead-lettered).
	 *
	 * If `allUpTo` is truthy, all outstanding messages prior to and including the given message are rejected.
	 * As with `#ack`, it’s a channel-ganking error to use a message that is not outstanding. Defaults to `false`.
	 *
	 * If `requeue` is truthy, the server will try to put the message or messages back on the queue or queues
	 * from which they came. Defaults to true if not given, so if you want to make sure messages are dead-lettered
	 * or discarded, supply false here.
	 *
	 * @note This and `#nackAll` use a RabbitMQ-specific extension.
	 * */
	nack(message: Message): void
	nack(message: Message, allUpTo: boolean): void
	nack(message: Message, allUpTo: boolean, requeue: boolean): void

	/**
	 * Reject all messages outstanding on this channel. If requeue is truthy, or omitted, the server will
	 * try to re-enqueue the messages.
	 * */
	nack(): void
	nack(requeue: boolean): void

	/**
	 * Reject a message. Equivalent to `#nack(message, false, requeue)`, but works in older versions of
	 * RabbitMQ (< v2.3.0) where `#nack` does not.
	 * */
	reject(message: Message): void
	reject(message: Message, requeue: boolean): void

	/**
	 * Set the prefetch count for this channel. The `count` given is the maximum number of messages sent over the
	 * channel that can be awaiting acknowledgement; once there are `count` messages outstanding, the server will
	 * not send more messages on this channel until one or more have been acknowledged. A falsey value for `count`
	 * indicates no such limit.
	 *
	 * NB RabbitMQ v3.3.0 changes the meaning of prefetch (basic.qos) to apply per-consumer, rather than per-channel.
	 * It will apply to consumers started after the method is called. See rabbitmq-prefetch.
	 *
	 * Use the `global` flag to get the per-channel behaviour. To keep life interesting, using the `global` flag with
	 * an RabbitMQ older than v3.3.0 will bring down the whole connection.
	 *
	 * @note A callback is supplied but not mentioned in the documents
	 * */
	prefetch(count: number): AsyncPromise<IFields>
	prefetch(count: number, global: boolean): AsyncPromise<IFields>

	/**
	 * Requeue unacknowledged messages on this channel. The server will reply (with an empty object) once
	 * all messages are requeued.
	 * */
	recover(): AsyncPromise<IFields>
}

export function connect(): Promise<Connection>
export function connect(options: Partial<SocketOptions>): Promise<Connection>
export function connect(url: string): Promise<Connection>
export function connect(url: string, options: Partial<SocketOptions>): Promise<Connection>

export const credentials: Credentials

export { IllegalOperationError } from './types/common'
