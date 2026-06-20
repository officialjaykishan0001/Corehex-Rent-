const mongoose = require("mongoose");

const quoteItemSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const quoteSchema = new mongoose.Schema(
    {
        reference: {
            type: String,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        requirements: {
            type: String,
            default: "",
            trim: true,
        },
        items: {
            type: [quoteItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "At least one item is required",
            },
        },
        estimatedTotal: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["new", "contacted", "quoted", "converted", "closed"],
            default: "new",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Quote", quoteSchema);
