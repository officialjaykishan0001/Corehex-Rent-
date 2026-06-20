const Equipment = require("../models/equipmentModel");

const getInventorySummary = async (req, res) => {
  try {
    const items = await Equipment.find();

    const total = items.reduce(
      (sum, item) => sum + item.totalQuantity,
      0
    );

    const available = items.reduce(
      (sum, item) => sum + item.availableQuantity,
      0
    );

    const rented = items.reduce(
      (sum, item) => sum + item.rentedQuantity,
      0
    );

    const maintenance = items.reduce(
      (sum, item) => sum + item.maintenanceQuantity,
      0
    );

    const lowStock = items.filter(
      (item) =>
        item.availableQuantity > 0 &&
        item.availableQuantity <= 2
    );

    const outOfStock = items.filter(
      (item) => item.availableQuantity === 0
    );

    res.status(200).json({
      success: true,
      total,
      available,
      rented,
      maintenance,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInventoryItems = async (req, res) => {
  try {
    const items = await Equipment.find();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getInventorySummary,
  getInventoryItems,
};