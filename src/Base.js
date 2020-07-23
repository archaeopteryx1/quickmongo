const EventEmitter = require("events").EventEmitter;
const mongoose = require("mongoose");
const Error = require("./Error");

class Base extends EventEmitter {

    /**
     * Instantiates the base database.
     * This class is implemented by the main Database class.
     * @param {String} mongodbURL Mongodb Database URL.
     * @param {Object} connectionOptions Mongodb connection options
     * @returns {Base}
     * @example const db = new Base("mongodb://localhost/mydb");
     */
    constructor(mongodbURL, connectionOptions={}) {
        super();
        if (!mongodbURL || !mongodbURL.startsWith("mongodb")) throw new Error("No mongodb url was provided!");
        if (typeof mongodbURL !== "string") throw new Error(`Expected a string for mongodbURL, received ${typeof mongodbURL}`);
        if (connectionOptions && typeof connectionOptions !== "object") throw new Error(`Expected Object for connectionOptions, received ${typeof connectionOptions}`);

        /**
         * Current database url
         * @type {String}
         */
        this.dbURL = mongodbURL;

        /**
         * Mongoose connection options
         * @type {Object}
         */
        this.options = connectionOptions;

        this._create();

        mongoose.connection.on("error", (e) => {
            this.emit("error", e);
        });
        mongoose.connection.on("open", () => {
            /**
             * Timestamp when database became ready
             * @type {Date}
             */
            this.readyAt = new Date();
            this.emit("ready");
        });
    }

    /**
     * Creates mongodb connection
     * @private
     */
    _create() {
        this.emit("Creating database connection...");
        mongoose.connect(this.dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * Destroys database
     * @private
     */
    _destroyDatabase() {
        mongoose.disconnect();
        this.readyAt = undefined;
        this.dbURL = null;
        this.emit("debug", "Database disconnected!");
    }
}

/**
 * Emitted when database creates connection
 * @event Base#ready
 * @example db.on("ready", () => {
 *     console.log("Successfully connected to the database!");
 * });
 */

/**
 * Emitted when database encounters error
 * @event Base#error
 * @param {Error} Error Error Message
 * @example db.on("error", console.error);
 */

 /**
  * Emitted on debug mode
  * @event Base#debug
  * @param {String} Message Debug message
  * @example db.on("debug", console.log);
  */

module.exports = Base;