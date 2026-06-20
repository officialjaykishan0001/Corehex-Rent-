const Booking = require("../models/bookingModel");
const Equipment = require("../models/equipmentModel");

const getOverview = async (req, res) => {
    try {
        const [bookings, equipment] = await Promise.all([
            Booking.find(),
            Equipment.find(),
        ]);


        const monthlyRevenue = bookings
            .filter(
                (b) =>
                    new Date(b.createdAt).getMonth() ===
                    new Date().getMonth()
            )
            .reduce((sum, b) => sum + b.estimatedCost, 0);

        const totalEquipment = equipment.length;

        const totalStock = equipment.reduce(
            (sum, e) => sum + e.totalQuantity,
            0
        );

        const availableInventory = equipment.reduce(
            (sum, e) => sum + e.availableQuantity,
            0
        );

        const activeRentals = bookings.filter(
            (b) => b.status === "confirmed"
        ).length;

        const pendingBookings = bookings.filter(
            (b) => b.status === "pending"
        ).length;

        const rentedQuantity = totalStock - availableInventory;

        res.status(200).json({
            totalEquipment,
            activeRentals,
            pendingBookings,
            monthlyRevenue,
            utilization:
                totalStock === 0
                    ? 0
                    : Math.round((rentedQuantity / totalStock) * 100),
            availableInventory,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getTrends = async (req, res) => {
    try {
        const bookings = await Booking.find();


        const trends = {};

        bookings.forEach((booking) => {
            const month = new Date(booking.createdAt).toLocaleString(
                "en-US",
                { month: "short" }
            );

            if (!trends[month]) {
                trends[month] = {
                    label: month,
                    revenue: 0,
                    bookings: 0,
                };
            }

            trends[month].revenue += booking.estimatedCost;
            trends[month].bookings += 1;
        });

        res.status(200).json(
            Object.values(trends)
        );


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCategoryPerformance = async (req, res) => {
    try {
        const [bookings, equipment] = await Promise.all([
            Booking.find(),
            Equipment.find(),
        ]);


        const equipmentMap = {};

        equipment.forEach((item) => {
            equipmentMap[item.slug] = item.category;
        });

        const categoryMap = {};

        bookings.forEach((booking) => {
            const category = equipmentMap[booking.equipmentSlug];

            if (!category) return;

            if (!categoryMap[category]) {
                categoryMap[category] = {
                    category,
                    bookings: 0,
                    revenue: 0,
                };
            }

            categoryMap[category].bookings += 1;
            categoryMap[category].revenue += booking.estimatedCost;
        });

        res.status(200).json(
            Object.values(categoryMap)
        );


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMostRented = async (req, res) => {
    try {
        const [bookings, equipment] = await Promise.all([
            Booking.find(),
            Equipment.find(),
        ]);


        const equipmentNames = {};

        equipment.forEach((item) => {
            equipmentNames[item.slug] = item.name;
        });

        const countMap = {};

        bookings.forEach((booking) => {
            const name =
                equipmentNames[booking.equipmentSlug] ||
                booking.equipmentSlug;

            countMap[name] =
                (countMap[name] || 0) +
                booking.quantity;
        });

        const result = Object.entries(countMap)
            .map(([name, count]) => ({
                name,
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        res.status(200).json(result);


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getOverview,
    getTrends,
    getCategoryPerformance,
    getMostRented,
};
