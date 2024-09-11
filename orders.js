const express = require('express');
const router = express.Router();


// const orders = [
//     { id: 1, clientId: 1, amount: 100, date: '2023-01-01' },
//     { id: 2, clientId: 2, amount: 150, date: '2023-01-02' },
//     { id: 3, clientId: 1, amount: 200, date: '2023-01-03' },
//     { id: 4, clientId: 3, amount: 50, date: '2023-01-04' },
// ];

router.get('/analytics', (req, res) => {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
    const avgOrderAmount = totalAmount / totalOrders;

    const analytics = {
        totalOrders,
        totalAmount,
        avgOrderAmount,
    };

    res.json(analytics);
});

module.exports = router;
