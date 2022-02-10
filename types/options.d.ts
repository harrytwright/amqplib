export interface IOptions {}

export interface IAssertQueueOptions extends IOptions {
	// If true, scopes the queue to the connection (defaults to false)
	exclusive: boolean
	// if true, the queue will survive broker restarts, modulo the effects of `exclusive`
	// and `autoDelete`; this defaults to true if not supplied, unlike the others
	durable: boolean
	// If true, the queue will be deleted when the number of consumers drops to zero (defaults to false)
	autoDelete: boolean
	// additional arguments, usually parameters for some kind of broker-specific extension e.g., high availability, TTL.
	arguments: object
	// (0 <= n < 2^32): expires messages arriving in the queue after n milliseconds
	messageTtl: number
	// (0 < n < 2^32): the queue will be destroyed after n milliseconds of disuse, where use means having consumers,
	// being declared (asserted or checked, in this API), or being polled with a `get`
	expires: number
	// An exchange to which messages discarded from the queue will be resent.
	deadLetterExchange: string
	// sets a maximum number of messages the queue will hold. Old messages will be
	// discarded (dead-lettered if that’s set) to make way for new messages.
	maxLength: number
	// makes the queue a priority queue.
	maxPriority: number
}

export interface IDeleteQueueOptions extends IOptions {
	// if true and the queue has consumers, it will not be deleted and
	// the channel will be closed. Defaults to false.
	ifUnused: boolean
	// if true and the queue contains messages, the queue will not be deleted
	// and the channel will be closed. Defaults to false.
	ifEmpty: boolean
}

export interface IAssertExchangeOptions extends IOptions {
	// If true, the exchange will survive broker restarts. Defaults to true.
	durable: boolean
	// If true, messages cannot be published directly to the exchange (i.e., it can only be the
	// target of bindings, or possibly create messages ex-nihilo). Defaults to false.
	internal: boolean
	// If true, the exchange will be destroyed once the number of bindings for which it is
	// the source drop to zero. Defaults to false.
	autoDelete: boolean
	// An exchange to send messages to if this exchange can’t route them to any queues.
	alternateExchange: string
	// Any additional arguments that may be needed by an exchange type.
	arguments: object
}

export interface IDeleteExchangeOptions extends IOptions {
	// If true and the exchange has bindings, it will not be deleted and the channel will be closed.
	ifUnused: boolean
}

export interface IPublishOptions extends IOptions {
	// If supplied, the message will be discarded from a queue once it’s been there longer than the given
	// number of milliseconds. In the specification this is a string; numbers supplied here will be coerced to
	// string for transit.
	expiration: string
	// If supplied, RabbitMQ will compare it to the username supplied when opening the connection, and reject
	// messages for which it does not match.
	userId: string
	// An array of routing keys as strings; messages will be routed to these routing keys in addition to that
	// given as the `routingKey` parameter. A string will be implicitly treated as an array containing just that
	// string. This will override any value given for `CC` in the `headers` parameter.
	//
	// @note The property names `CC` and `BCC` are case-sensitive.
	CC: string | string[]
	// A priority for the message; ignored by versions of RabbitMQ older than 3.5.0, or if the queue is not
	// a priority queue (see `maxPriority` above).
	priority: number
	// If truthy, the message will survive broker restarts provided it’s in a queue that also survives restarts.
	// Corresponds to, and overrides, the property `deliveryMode`.
	persistent: boolean
	// Either 1 or falsey, meaning non-persistent; or, 2 or truthy, meaning persistent. That’s just obscure
	// though. Use the option persistent instead.
	deliveryMode: 1 | 2 | boolean

	/**
	 * Used by RabbitMQ but not sent on to consumers:
	 * */

	// If true, the message will be returned if it is not routed to a queue (i.e., if there
	// are no bindings that match its routing key).
	mandatory: boolean
	/**
	 * @see CC
	 * */
	BCC: string | string[]

	/**
	 * Ignored by RabbitMQ (but may be useful for applications):
	 * */

	// A MIME type for the message content
	contentType: string
	// A MIME encoding for the message content
	contentEncoding: string
	// application specific headers to be carried along with the message content. The value as sent may be
	// augmented by extension-specific fields if they are given in the parameters, for example, ‘CC’, since
	// these are encoded as message headers; the supplied value won’t be mutated.
	headers: object
	// Usually used to match replies to requests, or similar
	correlationId: string
	// Often used to name a queue to which the receiving application must send replies,
	// in an RPC scenario (many libraries assume this pattern)
	replyTo: string
	// Arbitrary application-specific identifier for the message
	messageId: string
	// A timestamp for the message
	timestamp: number
	// An arbitrary application-specific type for the message
	type: string
	// An arbitrary identifier for the originating application
	appId: string
}

export interface IConsumeOptions extends IOptions {
	// A name which the server will use to distinguish message deliveries for the consumer; must not be already
	// in use on the channel. It’s usually easier to omit this, in which case the server will create a random name
	// and supply it in the reply.
	consumerTag: string
	// In theory, if true then the broker won’t deliver messages to the consumer if they were also published on this
	// connection; RabbitMQ does not implement it though, and will ignore it. Defaults to false.
	noLocal: boolean
	// If true, the broker won’t expect an acknowledgement of messages delivered to this consumer; i.e., it will
	// dequeue messages as soon as they’ve been sent down the wire. Defaults to false (i.e., you will be expected
	// to acknowledge messages).
	noAck: boolean
	// If true, the broker won’t let anyone else consume from this queue; if there already is a consumer, there goes
	// your channel (so usually only useful if you’ve made a ‘private’ queue by letting the server choose its name).
	exclusive: boolean
	// Gives a priority to the consumer; higher priority consumers get messages in preference to lower priority consumers.
	priority: number
	// Arbitrary arguments. Go to town.
	arguments: object
}

export interface IGetOptions extends IOptions {
	// if true, the message will be assumed by the server to be acknowledged (i.e., dequeued) as soon as it’s been
	// sent over the wire. Default is false, that is, you will be expected to acknowledge the message.
	noAck: Boolean
}
