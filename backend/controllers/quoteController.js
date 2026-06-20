const Quote = require("../models/quoteModel");
const Notification = require("../models/notificationModel");

const createQuote = async (req, res) => {
    try {
        const reference = `QT-${Date.now()}`;


        const quote = await Quote.create({
            ...req.body,
            reference,
        });

        await Notification.create({
            kind: "quote",
            title: "New quote request",
            message: `${quote.name} • ${quote.company} (${quote.items.length} items)`,
            href: "/admin/quotes",
        });

        res.status(201).json({
            success: true,
            data: quote,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find().sort({
            createdAt: -1,
        });


        res.status(200).json({
            success: true,
            data: quotes,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);


        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote not found",
            });
        }

        res.status(200).json({
            success: true,
            data: quote,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateQuoteStatus = async (req, res) => {
    try {
        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
            },
            {
                new: true,
            }
        );


        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote not found",
            });
        }

        res.status(200).json({
            success: true,
            data: quote,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createQuote,
    getQuotes,
    getQuoteById,
    updateQuoteStatus,
};
