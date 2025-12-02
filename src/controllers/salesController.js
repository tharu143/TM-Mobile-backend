const { Sale, Product, Customer } = require('../models');

exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find({});
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSale = async (req, res) => {
    try {
        const data = req.body;

        // Update stock
        for (const item of data.items) {
            await Product.updateOne({ _id: item.id }, { $inc: { stock: -item.quantity } });
        }

        // Update/Create Customer
        let customerId = data.customer.id;
        if (customerId) {
            await Customer.updateOne(
                { _id: customerId },
                {
                    $inc: { purchases: 1, totalPurchases: data.manualTotal || data.total },
                    $set: { lastPurchase: data.timestamp.slice(0, 10), name: data.customer.name, phone: data.customer.phone }
                }
            );
        } else {
            const newCust = await Customer.create({
                name: data.customer.name,
                phone: data.customer.phone,
                purchases: 1,
                totalPurchases: data.manualTotal || data.total,
                lastPurchase: data.timestamp.slice(0, 10)
            });
            customerId = newCust._id.toString();
        }

        const saleData = { ...data, customer: { ...data.customer, id: customerId }, status: 'completed' };
        const sale = await Sale.create(saleData);
        res.status(201).json({ message: "Sale processed", saleId: sale._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
