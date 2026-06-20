const Booking = require("../models/bookingModel");
const Quote = require("../models/quoteModel");

const getCustomers = async (req, res) => {
    try {
        const [bookings, quotes] = await Promise.all([
            Booking.find(),
            Quote.find()
        ]);


        const map = new Map();

        bookings.forEach((b) => {
            const key = b.email.toLowerCase();

            const customer = map.get(key) || {
                id: key,
                name: b.name,
                company: b.company,
                email: b.email,
                phone: b.phone,
                totalBookings: 0,
                lifetimeRevenue: 0,
                firstSeen: b.createdAt,
                lastSeen: b.createdAt,
            };

            customer.totalBookings += 1;
            customer.lifetimeRevenue += b.estimatedCost;

            if (b.createdAt < customer.firstSeen)
                customer.firstSeen = b.createdAt;

            if (b.createdAt > customer.lastSeen)
                customer.lastSeen = b.createdAt;

            map.set(key, customer);
        });

        quotes.forEach((q) => {
            const key = q.email.toLowerCase();

            if (!map.has(key)) {
                map.set(key, {
                    id: key,
                    name: q.name,
                    company: q.company,
                    email: q.email,
                    phone: q.phone,
                    totalBookings: 0,
                    lifetimeRevenue: 0,
                    firstSeen: q.createdAt,
                    lastSeen: q.createdAt,
                });
            }
        });

        res.status(200).json({
            success: true,
            data: [...map.values()].sort(
                (a, b) => b.lifetimeRevenue - a.lifetimeRevenue
            ),
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCustomerHistory = async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();


        const bookings = await Booking.find({
            email: { $regex: `^${email}$`, $options: "i" },
        });

        const quotes = await Quote.find({
            email: { $regex: `^${email}$`, $options: "i" },
        });

        res.status(200).json({
            success: true,
            bookings,
            quotes,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCustomers,
    getCustomerHistory,
};
