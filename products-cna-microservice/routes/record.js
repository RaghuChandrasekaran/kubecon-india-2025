const express = require('express');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require('../db/conn');

/**
 * @swagger
 * /deals:
 *   get:
 *     summary: Get a list of all deals
 *     description: Retrieves a list of current deals from the database
 *     responses:
 *       200:
 *         description: A list of deals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *       400:
 *         description: Error fetching deals
 */
recordRoutes.route('/deals').get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('deals')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching deals!');
      } else {
        res.json(result);
      }
    });
});

/**
 * @swagger
 * /products/sku/{id}:
 *   get:
 *     summary: Get a product by SKU
 *     description: Retrieves a single product based on its SKU ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: SKU ID of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 variants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sku:
 *                         type: string
 *       400:
 *         description: Error fetching product
 */
recordRoutes.route('/products/sku/:id').get(async function (_req, res) {
  const skuID = _req.params.id
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('products')
    .findOne({'variants.sku': skuID}, (function (err, result) {
      if (err) {
        res.status(400).send('Error fetching deals!');
      } else {
        res.json(result);
      }
    }))
});

module.exports = recordRoutes;
